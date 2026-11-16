-- =====================================================================
-- Siddiona Careers - 0003 triggers, guards and backfill
--
-- Everything here exists because a policy cannot express it:
--   * "this column did not change" needs a BEFORE UPDATE trigger
--   * profile creation on signup needs a trigger on auth.users
--   * admin role assignment must never be reachable from client code
-- =====================================================================

-- ---------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------
drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists jobs_touch_updated_at on public.jobs;
create trigger jobs_touch_updated_at
  before update on public.jobs
  for each row execute function public.touch_updated_at();

drop trigger if exists applications_touch_updated_at on public.applications;
create trigger applications_touch_updated_at
  before update on public.applications
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- handle_new_user
--
-- Runs on every Supabase Auth signup, for both email/password and
-- Google OAuth. Creates the candidate profile, and promotes the user to
-- admin if their address is on the allowlist.
--
-- Admin assignment lives here rather than in application code so that
-- there is no `if (email === "...")` check anywhere in the codebase.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $newuser$
begin
  -- Aliased as `p` so the ON CONFLICT clause can reference the existing
  -- row. A schema-qualified `public.profiles.full_name` is not a valid
  -- reference to the conflict target, and with search_path pinned to ''
  -- an unqualified `profiles` would not resolve either.
  --
  -- `coalesce(new.email, '')` guards the NOT NULL column. Every provider
  -- this project enables supplies an address, but a provider that did
  -- not would otherwise fail the whole signup inside this trigger.
  insert into public.profiles as p (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(
      btrim(
        coalesce(
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'name',
          ''
        )
      ),
      ''
    )
  )
  on conflict (id) do update
    set email      = excluded.email,
        -- Never overwrite a name the candidate has already edited.
        full_name  = coalesce(p.full_name, excluded.full_name),
        updated_at = now();

  if exists (
    select 1
    from public.admin_allowlist al
    where al.email = new.email
  ) then
    insert into public.admin_users (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$newuser$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profile email in step if the user changes it in Supabase Auth.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $emailchange$
begin
  if new.email is distinct from old.email then
    update public.profiles
       set email = new.email, updated_at = now()
     where id = new.id;
  end if;
  return new;
end;
$emailchange$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------
-- jobs: keep published_at honest.
-- An admin flipping status to 'published' should not have to remember
-- to stamp the date, and re-publishing should not rewrite history.
-- ---------------------------------------------------------------------
create or replace function public.jobs_sync_published_at()
returns trigger
language plpgsql
set search_path = ''
as $jobspub$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$jobspub$;

drop trigger if exists jobs_sync_published_at on public.jobs;
create trigger jobs_sync_published_at
  before insert or update on public.jobs
  for each row execute function public.jobs_sync_published_at();

-- ---------------------------------------------------------------------
-- applications: candidate update guard
--
-- The RLS UPDATE policy can only say "this row is yours". It cannot say
-- "you did not change the status column". This trigger does.
--
-- A non-admin has every immutable column forced back to its prior value.
-- The single permitted transition is a withdrawal from a live status.
--
-- auth.uid() is null only for service_role here, because anon has
-- neither a grant nor a policy permitting UPDATE on this table.
-- ---------------------------------------------------------------------
create or replace function public.applications_guard_candidate_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $appguard$
declare
  v_actor uuid := (select auth.uid());
begin
  if v_actor is null or public.is_admin() then
    return new;
  end if;

  -- Identity and submission content are frozen after submission.
  new.id              := old.id;
  new.reference       := old.reference;
  new.job_id          := old.job_id;
  new.user_id         := old.user_id;
  new.full_name       := old.full_name;
  new.email           := old.email;
  new.phone           := old.phone;
  new.resume_path     := old.resume_path;
  new.cover_letter    := old.cover_letter;
  new.linkedin_url    := old.linkedin_url;
  new.portfolio_url   := old.portfolio_url;
  new.github_url      := old.github_url;
  new.additional_info := old.additional_info;
  new.created_at      := old.created_at;

  if new.status is distinct from old.status then
    if new.status = 'withdrawn'
       and old.status in ('submitted', 'under_review', 'shortlisted', 'interview', 'offer')
    then
      -- Permitted: the candidate is withdrawing.
      null;
    else
      new.status := old.status;
    end if;
  end if;

  return new;
end;
$appguard$;

drop trigger if exists applications_guard_candidate_update on public.applications;
create trigger applications_guard_candidate_update
  before update on public.applications
  for each row execute function public.applications_guard_candidate_update();

-- ---------------------------------------------------------------------
-- applications: status timeline
--
-- Written by the database rather than by the server action, so the
-- timeline cannot drift out of step with the row it describes.
-- ---------------------------------------------------------------------
create or replace function public.applications_log_initial_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $appinit$
begin
  insert into public.application_events (application_id, old_status, new_status, changed_by)
  values (new.id, null, new.status, new.user_id);
  return new;
end;
$appinit$;

drop trigger if exists applications_log_initial_event on public.applications;
create trigger applications_log_initial_event
  after insert on public.applications
  for each row execute function public.applications_log_initial_event();

create or replace function public.applications_log_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $appstatus$
begin
  if new.status is distinct from old.status then
    insert into public.application_events (application_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, (select auth.uid()));
  end if;
  return new;
end;
$appstatus$;

drop trigger if exists applications_log_status_change on public.applications;
create trigger applications_log_status_change
  after update on public.applications
  for each row execute function public.applications_log_status_change();

-- ---------------------------------------------------------------------
-- consume_rate_limit
--
-- A fixed-window counter in Postgres. Serverless instances do not share
-- memory, so an in-process limiter would be trivially defeated by
-- hitting a cold instance; this one holds globally.
--
-- Returns true when the call is allowed, false when the caller is over
-- their limit for the current window.
-- ---------------------------------------------------------------------
create or replace function public.consume_rate_limit(
  p_bucket         text,
  p_limit          integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $ratelimit$
declare
  v_now     timestamptz := now();
  v_counter integer;
begin
  insert into public.rate_limits as r (bucket, window_start, counter)
  values (p_bucket, v_now, 1)
  on conflict (bucket) do update
    set window_start = case
          when r.window_start < v_now - make_interval(secs => p_window_seconds) then v_now
          else r.window_start
        end,
        counter = case
          when r.window_start < v_now - make_interval(secs => p_window_seconds) then 1
          else r.counter + 1
        end
  returning r.counter into v_counter;

  return v_counter <= p_limit;
end;
$ratelimit$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- Admin allowlist seed
--
-- Must run before the backfill below, otherwise there is nothing to
-- match existing users against. Add further addresses here, or insert
-- into public.admin_allowlist directly from the Supabase SQL editor.
-- ---------------------------------------------------------------------
insert into public.admin_allowlist (email, note)
values ('info@example.com', 'Initial administrator')
on conflict (email) do nothing;

-- ---------------------------------------------------------------------
-- Backfill
--
-- The triggers above only fire for future signups. These statements
-- cover users who already exist in this Supabase project, so an admin
-- who registered before this migration is still promoted.
-- ---------------------------------------------------------------------
insert into public.profiles (id, email, full_name)
select
  u.id,
  coalesce(u.email, ''),
  nullif(
    btrim(
      coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')
    ),
    ''
  )
from auth.users u
where u.email is not null
on conflict (id) do nothing;

insert into public.admin_users (user_id)
select u.id
from auth.users u
join public.admin_allowlist al on al.email = u.email
on conflict (user_id) do nothing;
