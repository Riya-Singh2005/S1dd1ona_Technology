-- =====================================================================
-- Siddiona Careers - 0001 schema
-- Tables, enums, indexes and helper generators for the hiring platform.
-- Idempotent: safe to run more than once on the same project.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $enums$
begin
  if not exists (select 1 from pg_type where typname = 'job_status') then
    create type public.job_status as enum ('draft', 'published', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'employment_type') then
    create type public.employment_type as enum ('full_time', 'part_time', 'contract', 'internship', 'temporary');
  end if;

  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum (
      'submitted', 'under_review', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn'
    );
  end if;
end
$enums$;

-- ---------------------------------------------------------------------
-- profiles - candidate identity that is NOT authentication.
-- Supabase Auth owns credentials; this table owns application data only.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  email         citext not null,
  phone         text,
  location      text,
  linkedin_url  text,
  portfolio_url text,
  github_url    text,
  resume_path   text,
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

-- ---------------------------------------------------------------------
-- Admin role storage. Kept OUT of profiles so that a candidate who can
-- update their own profile row can never escalate themselves to admin.
-- ---------------------------------------------------------------------
create table if not exists public.admin_allowlist (
  email      citext primary key,
  note       text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'admin' check (role in ('admin', 'recruiter')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- jobs
-- All long-form content is plain text or text[]. Nothing is stored as
-- HTML, so rendering never needs dangerouslySetInnerHTML.
-- ---------------------------------------------------------------------
create table if not exists public.jobs (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null check (length(btrim(title)) between 2 and 160),
  slug                  text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  department            text not null,
  location              text not null,
  work_mode             text check (work_mode in ('onsite', 'hybrid', 'remote')),
  employment_type       public.employment_type not null default 'full_time',
  experience            text,
  salary_min            integer check (salary_min is null or salary_min >= 0),
  salary_max            integer check (salary_max is null or salary_max >= 0),
  currency              text not null default 'INR',
  short_description     text not null check (length(btrim(short_description)) between 10 and 400),
  description           text not null check (length(btrim(description)) >= 10),
  responsibilities      text[] not null default '{}',
  requirements          text[] not null default '{}',
  nice_to_have          text[] not null default '{}',
  what_you_will_work_on text[] not null default '{}',
  benefits              text[] not null default '{}',
  hiring_process        jsonb  not null default '[]'::jsonb,
  status                public.job_status not null default 'draft',
  published_at          timestamptz,
  closing_at            timestamptz,
  created_by            uuid references auth.users (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint jobs_salary_range_valid check (
    salary_min is null or salary_max is null or salary_max >= salary_min
  ),
  constraint jobs_hiring_process_is_array check (jsonb_typeof(hiring_process) = 'array')
);

-- status is in every public query; published_at drives ordering.
create index if not exists jobs_status_published_at_idx on public.jobs (status, published_at desc);
create index if not exists jobs_department_idx          on public.jobs (department);
create index if not exists jobs_employment_type_idx     on public.jobs (employment_type);
create index if not exists jobs_created_by_idx          on public.jobs (created_by);

-- ---------------------------------------------------------------------
-- applications
-- UNIQUE (user_id, job_id) is the real duplicate-prevention mechanism.
-- ---------------------------------------------------------------------
create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  job_id          uuid not null references public.jobs (id) on delete restrict,
  user_id         uuid not null references auth.users (id) on delete cascade,
  full_name       text not null check (length(btrim(full_name)) between 2 and 120),
  email           citext not null,
  phone           text not null check (length(btrim(phone)) between 6 and 32),
  resume_path     text not null,
  cover_letter    text not null check (length(btrim(cover_letter)) between 40 and 8000),
  linkedin_url    text,
  portfolio_url   text,
  github_url      text,
  additional_info text check (additional_info is null or length(additional_info) <= 2000),
  status          public.application_status not null default 'submitted',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint applications_unique_user_job unique (user_id, job_id)
);

create index if not exists applications_user_id_idx    on public.applications (user_id);
create index if not exists applications_job_id_idx     on public.applications (job_id);
create index if not exists applications_status_idx     on public.applications (status);
create index if not exists applications_created_at_idx on public.applications (created_at desc);
create index if not exists applications_email_idx      on public.applications (email);

-- ---------------------------------------------------------------------
-- Human-facing application reference, e.g. SID-7KQ2M4.
-- Crockford-style alphabet: no I, L, O or U, so a reference can be read
-- aloud on a phone call without ambiguity.
-- Defined after `applications` because it reads that table.
-- ---------------------------------------------------------------------
-- SECURITY DEFINER is required, not decorative.
--
-- Called as a column default, this runs as the inserting candidate. Under
-- RLS that caller can only see their OWN applications, so the uniqueness
-- loop would be blind to every other candidate's reference: a collision
-- would pass the check, trip the unique constraint, and surface to the
-- candidate as "you have already applied" for a role they have never seen.
-- Running as the owner lets the check see the whole table.
--
-- It returns nothing but a generated string, so it leaks no data.
create or replace function public.generate_application_reference()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $genref$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  candidate text;
  attempt   int := 0;
begin
  loop
    candidate := 'SID-';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;

    exit when not exists (select 1 from public.applications a where a.reference = candidate);

    attempt := attempt + 1;
    if attempt > 25 then
      raise exception 'Could not allocate a unique application reference after % attempts', attempt;
    end if;
  end loop;

  return candidate;
end;
$genref$;

alter table public.applications
  alter column reference set default public.generate_application_reference();

revoke all on function public.generate_application_reference() from public;
grant execute on function public.generate_application_reference() to authenticated, service_role;

-- ---------------------------------------------------------------------
-- application_events - the candidate-visible status timeline.
-- Deliberately carries no free-text note field, so there is nothing
-- here that would be unsafe to show a candidate.
-- ---------------------------------------------------------------------
create table if not exists public.application_events (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  old_status     public.application_status,
  new_status     public.application_status not null,
  changed_by     uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now()
);

create index if not exists application_events_application_id_idx
  on public.application_events (application_id, created_at);

-- ---------------------------------------------------------------------
-- application_notes - internal recruiter commentary.
-- Separate table because RLS is row-level, not column-level: an
-- admin_notes column on applications would be readable by the candidate
-- through their own SELECT policy.
-- ---------------------------------------------------------------------
create table if not exists public.application_notes (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  author_id      uuid references auth.users (id) on delete set null,
  body           text not null check (length(btrim(body)) between 1 and 4000),
  created_at     timestamptz not null default now()
);

create index if not exists application_notes_application_id_idx
  on public.application_notes (application_id, created_at desc);

-- ---------------------------------------------------------------------
-- email_events - delivery audit trail. Lets an admin see that a
-- notification failed instead of it vanishing silently.
-- ---------------------------------------------------------------------
create table if not exists public.email_events (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null,
  to_email       citext not null,
  application_id uuid references public.applications (id) on delete set null,
  status         text not null check (status in ('sent', 'failed', 'skipped')),
  provider_id    text,
  error          text,
  created_at     timestamptz not null default now()
);

create index if not exists email_events_created_at_idx     on public.email_events (created_at desc);
create index if not exists email_events_application_id_idx on public.email_events (application_id);

-- ---------------------------------------------------------------------
-- rate_limits - a small fixed-window counter used by sensitive server
-- actions. Lives in Postgres so the limit holds across every serverless
-- instance rather than per-process.
-- ---------------------------------------------------------------------
create table if not exists public.rate_limits (
  bucket       text primary key,
  window_start timestamptz not null default now(),
  counter      integer not null default 0
);

-- ---------------------------------------------------------------------
-- Shared updated_at trigger function
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $touch$
begin
  new.updated_at := now();
  return new;
end;
$touch$;
