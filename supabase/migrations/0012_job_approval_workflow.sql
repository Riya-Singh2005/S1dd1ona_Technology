-- Super Admin approval workflow for job publishing.
-- Requires 0010_admin_management.sql and 0011_job_approval_status_values.sql.

-- Internal review data is deliberately separate from public.jobs. Anonymous
-- and candidate sessions can read published job rows, so review reasons and
-- administrator identities must never be columns on that public surface.
create table if not exists public.job_approval_state (
  job_id          uuid primary key references public.jobs (id) on delete cascade,
  submitted_by    uuid references auth.users (id) on delete set null,
  submitted_at    timestamptz,
  reviewed_by     uuid references auth.users (id) on delete set null,
  reviewed_at     timestamptz,
  review_reason   text,
  updated_at      timestamptz not null default now(),
  constraint job_approval_reason_length check (
    review_reason is null
    or length(btrim(review_reason)) between 1 and 2000
  )
);

create index if not exists job_approval_state_submitted_at_idx
  on public.job_approval_state (submitted_at desc);

alter table public.job_approval_state enable row level security;

revoke all on public.job_approval_state from public, anon, authenticated;
grant select on public.job_approval_state to authenticated;

drop policy if exists "job_approval_state_admin_read" on public.job_approval_state;
create policy "job_approval_state_admin_read"
  on public.job_approval_state
  for select
  to authenticated
  using ((select public.is_admin()));

-- Content remains editable by administrators. Status, publication metadata,
-- creator identity, and review state can only be changed by trusted database
-- code. INSERT keeps status writable because draft/submission/direct-manager
-- publication are intentionally one atomic statement; the trigger below
-- validates the caller and stamps the creator.
revoke insert, update on public.jobs from authenticated;

grant insert (
  title, slug, department, location, work_mode, employment_type, experience,
  salary_min, salary_max, currency, short_description, description,
  responsibilities, requirements, nice_to_have, what_you_will_work_on,
  benefits, hiring_process, closing_at, status
) on public.jobs to authenticated;

grant update (
  title, slug, department, location, work_mode, employment_type, experience,
  salary_min, salary_max, currency, short_description, description,
  responsibilities, requirements, nice_to_have, what_you_will_work_on,
  benefits, hiring_process, closing_at
) on public.jobs to authenticated;

drop policy if exists "jobs_admin_insert" on public.jobs;
create policy "jobs_admin_insert"
  on public.jobs
  for insert
  to authenticated
  with check (
    (select public.is_admin())
    and created_by = (select auth.uid())
    and (
      status in ('draft'::public.job_status, 'pending_approval'::public.job_status)
      or (
        status = 'published'::public.job_status
        and (select public.is_admin_manager())
      )
    )
  );

-- RLS establishes administrator membership. Column grants and the trigger
-- enforce which changes an administrator may make.
drop policy if exists "jobs_admin_update" on public.jobs;
create policy "jobs_admin_update"
  on public.jobs
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create or replace function public.jobs_enforce_approval_workflow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $workflow$
declare
  v_user_id uuid := (select auth.uid());
  v_is_manager boolean := false;
  v_content_changed boolean := false;
begin
  -- Trusted database maintenance and service-role operations may not carry a
  -- user JWT. Browser callers still require grants and RLS, so this exception
  -- does not give anonymous sessions a write path.
  if v_user_id is null then
    return new;
  end if;

  if not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  v_is_manager := public.is_admin_manager();

  if tg_op = 'INSERT' then
    new.created_by := v_user_id;

    if new.status = 'published'::public.job_status and not v_is_manager then
      raise exception 'Super Admin approval is required before publishing.'
        using errcode = '42501';
    end if;

    if new.status not in (
      'draft'::public.job_status,
      'pending_approval'::public.job_status,
      'published'::public.job_status
    ) then
      raise exception 'A new job must be saved as a draft, submitted, or published by a Super Admin.'
        using errcode = '22023';
    end if;

    return new;
  end if;

  new.created_by := old.created_by;

  v_content_changed := row(
    new.title, new.slug, new.department, new.location, new.work_mode,
    new.employment_type, new.experience, new.salary_min, new.salary_max,
    new.currency, new.short_description, new.description,
    new.responsibilities, new.requirements, new.nice_to_have,
    new.what_you_will_work_on, new.benefits, new.hiring_process,
    new.closing_at
  ) is distinct from row(
    old.title, old.slug, old.department, old.location, old.work_mode,
    old.employment_type, old.experience, old.salary_min, old.salary_max,
    old.currency, old.short_description, old.description,
    old.responsibilities, old.requirements, old.nice_to_have,
    old.what_you_will_work_on, old.benefits, old.hiring_process,
    old.closing_at
  );

  if not v_is_manager and v_content_changed then
    if old.status in (
      'published'::public.job_status,
      'pending_approval'::public.job_status
    ) then
      new.status := 'draft'::public.job_status;
      delete from public.job_approval_state where job_id = old.id;
    elsif old.status = 'changes_requested'::public.job_status then
      new.status := old.status;
    else
      new.status := old.status;
    end if;
  end if;

  if new.status = 'published'::public.job_status and not v_is_manager then
    raise exception 'Super Admin approval is required before publishing.'
      using errcode = '42501';
  end if;

  if not v_is_manager
     and new.status is distinct from old.status
     and not (
       new.status in ('draft'::public.job_status, 'closed'::public.job_status)
       or (
         new.status = 'pending_approval'::public.job_status
         and old.status in (
           'draft'::public.job_status,
           'changes_requested'::public.job_status,
           'closed'::public.job_status
         )
       )
     ) then
    raise exception 'That job status transition is not allowed.' using errcode = '42501';
  end if;

  return new;
end;
$workflow$;

revoke all on function public.jobs_enforce_approval_workflow() from public, anon, authenticated, service_role;

drop trigger if exists jobs_enforce_approval_workflow on public.jobs;
create trigger jobs_enforce_approval_workflow
  before insert or update on public.jobs
  for each row execute function public.jobs_enforce_approval_workflow();

create or replace function public.jobs_record_initial_approval_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $initial$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    return new;
  end if;

  if new.status = 'pending_approval'::public.job_status then
    insert into public.job_approval_state (
      job_id, submitted_by, submitted_at, reviewed_by, reviewed_at, review_reason, updated_at
    ) values (
      new.id, v_user_id, now(), null, null, null, now()
    )
    on conflict (job_id) do update set
      submitted_by = excluded.submitted_by,
      submitted_at = excluded.submitted_at,
      reviewed_by = null,
      reviewed_at = null,
      review_reason = null,
      updated_at = now();
  elsif new.status = 'published'::public.job_status then
    insert into public.job_approval_state (
      job_id, submitted_by, submitted_at, reviewed_by, reviewed_at, review_reason, updated_at
    ) values (
      new.id, null, null, v_user_id, now(), null, now()
    )
    on conflict (job_id) do update set
      reviewed_by = excluded.reviewed_by,
      reviewed_at = excluded.reviewed_at,
      review_reason = null,
      updated_at = now();
  end if;

  return new;
end;
$initial$;

revoke all on function public.jobs_record_initial_approval_state() from public, anon, authenticated, service_role;

drop trigger if exists jobs_record_initial_approval_state on public.jobs;
create trigger jobs_record_initial_approval_state
  after insert on public.jobs
  for each row execute function public.jobs_record_initial_approval_state();

create or replace function public.submit_job_for_approval(p_job_id uuid)
returns public.job_status
language plpgsql
security definer
set search_path = ''
as $submit$
declare
  v_status public.job_status;
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null or not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  select status into v_status
  from public.jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'That job could not be found.' using errcode = 'P0002';
  end if;

  if v_status = 'pending_approval'::public.job_status then
    return v_status;
  end if;

  if v_status not in (
    'draft'::public.job_status,
    'changes_requested'::public.job_status,
    'closed'::public.job_status
  ) then
    raise exception 'Only a draft, changes-requested, or closed job can be submitted.'
      using errcode = 'P0001';
  end if;

  update public.jobs
  set status = 'pending_approval'::public.job_status
  where id = p_job_id;

  insert into public.job_approval_state (
    job_id, submitted_by, submitted_at, reviewed_by, reviewed_at, review_reason, updated_at
  ) values (
    p_job_id, v_user_id, now(), null, null, null, now()
  )
  on conflict (job_id) do update set
    submitted_by = excluded.submitted_by,
    submitted_at = excluded.submitted_at,
    reviewed_by = null,
    reviewed_at = null,
    review_reason = null,
    updated_at = now();

  return 'pending_approval'::public.job_status;
end;
$submit$;

create or replace function public.review_job_submission(
  p_job_id uuid,
  p_decision text,
  p_reason text default null
)
returns public.job_status
language plpgsql
security definer
set search_path = ''
as $review$
declare
  v_status public.job_status;
  v_user_id uuid := (select auth.uid());
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if v_user_id is null or not public.is_admin_manager() then
    raise exception 'Super Admin approval permission is required.' using errcode = '42501';
  end if;

  if p_decision not in ('approve', 'changes_requested') then
    raise exception 'That review decision is not valid.' using errcode = '22023';
  end if;

  if p_decision = 'changes_requested'
     and (v_reason is null or length(v_reason) > 2000) then
    raise exception 'Enter a reason between 1 and 2000 characters.' using errcode = '22023';
  end if;

  select status into v_status
  from public.jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'That job could not be found.' using errcode = 'P0002';
  end if;

  if v_status <> 'pending_approval'::public.job_status then
    raise exception 'This job is no longer pending approval. Refresh and review its current status.'
      using errcode = 'P0001';
  end if;

  if p_decision = 'approve' then
    update public.jobs
    set status = 'published'::public.job_status
    where id = p_job_id;

    insert into public.job_approval_state (
      job_id, reviewed_by, reviewed_at, review_reason, updated_at
    ) values (
      p_job_id, v_user_id, now(), null, now()
    )
    on conflict (job_id) do update set
      reviewed_by = excluded.reviewed_by,
      reviewed_at = excluded.reviewed_at,
      review_reason = null,
      updated_at = now();

    return 'published'::public.job_status;
  end if;

  update public.jobs
  set status = 'changes_requested'::public.job_status
  where id = p_job_id;

  insert into public.job_approval_state (
    job_id, reviewed_by, reviewed_at, review_reason, updated_at
  ) values (
    p_job_id, v_user_id, now(), v_reason, now()
  )
  on conflict (job_id) do update set
    reviewed_by = excluded.reviewed_by,
    reviewed_at = excluded.reviewed_at,
    review_reason = excluded.review_reason,
    updated_at = now();

  return 'changes_requested'::public.job_status;
end;
$review$;

create or replace function public.set_job_lifecycle(
  p_job_id uuid,
  p_status public.job_status
)
returns public.job_status
language plpgsql
security definer
set search_path = ''
as $lifecycle$
declare
  v_current public.job_status;
  v_user_id uuid := (select auth.uid());
  v_is_manager boolean := false;
begin
  if v_user_id is null or not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  v_is_manager := public.is_admin_manager();

  if p_status not in (
    'draft'::public.job_status,
    'published'::public.job_status,
    'closed'::public.job_status
  ) then
    raise exception 'That lifecycle status is not valid.' using errcode = '22023';
  end if;

  select status into v_current
  from public.jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'That job could not be found.' using errcode = 'P0002';
  end if;

  if p_status = v_current then
    return v_current;
  end if;

  if p_status = 'published'::public.job_status then
    if not v_is_manager then
      raise exception 'Super Admin approval is required before publishing.' using errcode = '42501';
    end if;
    if v_current = 'pending_approval'::public.job_status then
      raise exception 'Use the approval action for a pending job.' using errcode = 'P0001';
    end if;

    update public.jobs
    set status = 'published'::public.job_status
    where id = p_job_id;

    insert into public.job_approval_state (
      job_id, submitted_by, submitted_at, reviewed_by, reviewed_at, review_reason, updated_at
    ) values (
      p_job_id, null, null, v_user_id, now(), null, now()
    )
    on conflict (job_id) do update set
      reviewed_by = excluded.reviewed_by,
      reviewed_at = excluded.reviewed_at,
      review_reason = null,
      updated_at = now();

    return 'published'::public.job_status;
  end if;

  update public.jobs
  set status = p_status
  where id = p_job_id;

  delete from public.job_approval_state where job_id = p_job_id;
  return p_status;
end;
$lifecycle$;

revoke all on function public.submit_job_for_approval(uuid) from public, anon, service_role;
revoke all on function public.review_job_submission(uuid, text, text) from public, anon, service_role;
revoke all on function public.set_job_lifecycle(uuid, public.job_status) from public, anon, service_role;
grant execute on function public.submit_job_for_approval(uuid) to authenticated;
grant execute on function public.review_job_submission(uuid, text, text) to authenticated;
grant execute on function public.set_job_lifecycle(uuid, public.job_status) to authenticated;

-- Extend the existing aggregate without changing existing keys.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'openJobs', count(*) filter (where j.status = 'published'),
    'draftJobs', count(*) filter (where j.status = 'draft'),
    'pendingApprovalJobs', count(*) filter (where j.status = 'pending_approval'),
    'changesRequestedJobs', count(*) filter (where j.status = 'changes_requested'),
    'closedJobs', count(*) filter (where j.status = 'closed'),
    'totalApplications', (select count(*) from public.applications),
    'applicationsThisWeek', (
      select count(*)
      from public.applications
      where created_at >= now() - interval '7 days'
    ),
    'byStatus', coalesce((
      select jsonb_object_agg(status, status_count)
      from (
        select status::text as status, count(*) as status_count
        from public.applications
        group by status
      ) status_counts
    ), '{}'::jsonb)
  )
  into result
  from public.jobs j;

  return result;
end;
$$;
