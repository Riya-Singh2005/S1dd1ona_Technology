-- =====================================================================
-- Siddiona Careers - 0002 row level security
--
-- This file is the authorization layer for the entire careers feature.
-- The Next.js application is a convenience wrapper over these rules; if
-- every line of UI code were bypassed, these policies would still hold.
--
-- Authoring conventions (Supabase performance guidance):
--   * every policy names its TO role, so it is never evaluated for roles
--     it does not concern
--   * auth.uid() is always wrapped as (select auth.uid()) so the planner
--     hoists it to an InitPlan instead of re-evaluating per row
--   * every column referenced by a policy is indexed (see 0001)
-- =====================================================================

-- ---------------------------------------------------------------------
-- is_admin()
--
-- SECURITY DEFINER so it reads admin_users with the owner's rights.
-- Without this, any policy that checks admin_users would recursively
-- trigger admin_users' own policies.
-- search_path is pinned to '' so an attacker cannot shadow `public`.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $isadmin$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = (select auth.uid())
  );
$isadmin$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- Enable RLS everywhere. Supabase grants blanket table privileges to
-- anon/authenticated by default, so RLS is what actually gates access.
-- ---------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.admin_users        enable row level security;
alter table public.admin_allowlist    enable row level security;
alter table public.jobs               enable row level security;
alter table public.applications       enable row level security;
alter table public.application_events enable row level security;
alter table public.application_notes  enable row level security;
alter table public.email_events       enable row level security;
alter table public.rate_limits        enable row level security;

-- ---------------------------------------------------------------------
-- Narrow the blanket grants. RLS is the primary gate; these grants are
-- a second, independent barrier so that a policy mistake on its own is
-- not enough to expose data.
-- ---------------------------------------------------------------------
revoke all on public.profiles           from anon, authenticated;
revoke all on public.admin_users        from anon, authenticated;
revoke all on public.admin_allowlist    from anon, authenticated;
revoke all on public.jobs               from anon, authenticated;
revoke all on public.applications       from anon, authenticated;
revoke all on public.application_events from anon, authenticated;
revoke all on public.application_notes  from anon, authenticated;
revoke all on public.email_events       from anon, authenticated;
revoke all on public.rate_limits        from anon, authenticated;

-- Public job browsing.
grant select on public.jobs to anon, authenticated;
-- Admins are ordinary `authenticated` users, so job authoring privileges
-- live on that role and are narrowed to admins by policy.
grant insert, update, delete on public.jobs to authenticated;

grant select, insert, update on public.profiles to authenticated;

grant select, insert on public.applications to authenticated;
-- Column-level: a candidate withdrawing is the ONLY update they can
-- make, and the trigger in 0003 constrains which transitions are legal.
grant update (status) on public.applications to authenticated;

grant select on public.application_events to authenticated;
grant select, insert, delete on public.application_notes to authenticated;
grant select on public.email_events to authenticated;
grant select on public.admin_users to authenticated;

-- ---------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------
drop policy if exists "jobs_public_read_published" on public.jobs;
create policy "jobs_public_read_published"
  on public.jobs
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "jobs_admin_read_all" on public.jobs;
create policy "jobs_admin_read_all"
  on public.jobs
  for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "jobs_admin_insert" on public.jobs;
create policy "jobs_admin_insert"
  on public.jobs
  for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "jobs_admin_update" on public.jobs;
create policy "jobs_admin_update"
  on public.jobs
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "jobs_admin_delete" on public.jobs;
create policy "jobs_admin_delete"
  on public.jobs
  for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all"
  on public.profiles
  for select
  to authenticated
  using ((select public.is_admin()));

-- The row is normally created by the handle_new_user trigger; this
-- covers self-healing if a profile is ever missing.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- applications
--
-- The INSERT policy is where duplicate prevention, draft-job protection
-- and closed-job protection actually live. Combined with the
-- UNIQUE (user_id, job_id) constraint from 0001, a candidate cannot:
--   * apply as somebody else
--   * apply twice to the same role
--   * apply to an unpublished role
--   * apply to a role past its closing date
-- regardless of what the client sends.
-- ---------------------------------------------------------------------
drop policy if exists "applications_read_own" on public.applications;
create policy "applications_read_own"
  on public.applications
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "applications_admin_read_all" on public.applications;
create policy "applications_admin_read_all"
  on public.applications
  for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
  on public.applications
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.jobs j
      where j.id = job_id
        and j.status = 'published'
        and (j.closing_at is null or j.closing_at > now())
    )
  );

-- Candidates may touch their own row. The BEFORE UPDATE trigger in 0003
-- reduces that to "withdraw, and nothing else".
drop policy if exists "applications_update_own" on public.applications;
create policy "applications_update_own"
  on public.applications
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "applications_admin_update" on public.applications;
create policy "applications_admin_update"
  on public.applications
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- application_events - a candidate reads the timeline of their own
-- applications only.
-- ---------------------------------------------------------------------
drop policy if exists "application_events_read_own" on public.application_events;
create policy "application_events_read_own"
  on public.application_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      where a.id = application_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "application_events_admin_read_all" on public.application_events;
create policy "application_events_admin_read_all"
  on public.application_events
  for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- application_notes - admin only, with no candidate policy at all.
-- ---------------------------------------------------------------------
drop policy if exists "application_notes_admin_read" on public.application_notes;
create policy "application_notes_admin_read"
  on public.application_notes
  for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "application_notes_admin_insert" on public.application_notes;
create policy "application_notes_admin_insert"
  on public.application_notes
  for insert
  to authenticated
  with check ((select public.is_admin()) and author_id = (select auth.uid()));

drop policy if exists "application_notes_admin_delete" on public.application_notes;
create policy "application_notes_admin_delete"
  on public.application_notes
  for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- admin_users - readable by admins so the console can list the team.
-- Writes are service-role only; there is deliberately no INSERT or
-- UPDATE policy, so no signed-in user can ever grant themselves a role.
-- ---------------------------------------------------------------------
drop policy if exists "admin_users_admin_read" on public.admin_users;
create policy "admin_users_admin_read"
  on public.admin_users
  for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- email_events - admin-visible delivery log. Writes are service-role
-- only, from the server-side mailer.
-- ---------------------------------------------------------------------
drop policy if exists "email_events_admin_read" on public.email_events;
create policy "email_events_admin_read"
  on public.email_events
  for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- admin_allowlist and rate_limits carry no policies whatsoever, so they
-- are reachable only by service_role, which bypasses RLS. That is
-- intentional and is what keeps role assignment out of user hands.
-- ---------------------------------------------------------------------
