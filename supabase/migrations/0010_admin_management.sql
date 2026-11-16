-- =====================================================================
-- Siddiona Careers - 0010 administrator management
-- Adds one explicit administrator-management role and the narrowly
-- scoped functions used by the dashboard. Existing careers permissions
-- remain unchanged for ordinary administrators and legacy recruiters.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Roles and allowlist intent
-- ---------------------------------------------------------------------
alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('super_admin', 'admin', 'recruiter'));

alter table public.admin_allowlist
  add column if not exists role text not null default 'admin';

alter table public.admin_allowlist
  drop constraint if exists admin_allowlist_role_check;

alter table public.admin_allowlist
  add constraint admin_allowlist_role_check
  check (role in ('super_admin', 'admin', 'recruiter'));

-- Sales is the permanent bootstrap manager. The historical Info account
-- remains an ordinary administrator.
insert into public.admin_allowlist (email, note, role)
values ('sales@example.com', 'Sales administrator and account manager', 'super_admin')
on conflict (email) do update
set note = excluded.note,
    role = excluded.role;

update public.admin_allowlist
set role = 'admin'
where email = 'info@example.com';

update public.admin_users au
set role = case
  when lower(u.email) = 'sales@example.com' then 'super_admin'
  when lower(u.email) = 'info@example.com' then 'admin'
  else au.role
end
from auth.users u
where u.id = au.user_id
  and lower(u.email) in ('sales@example.com', 'info@example.com');

-- ---------------------------------------------------------------------
-- Future signups inherit the exact allowlisted role.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $newuser$
declare
  v_admin_role text;
begin
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
        full_name  = coalesce(p.full_name, excluded.full_name),
        updated_at = now();

  select al.role
    into v_admin_role
    from public.admin_allowlist al
   where al.email = new.email;

  if v_admin_role is not null then
    insert into public.admin_users (user_id, role)
    values (new.id, v_admin_role)
    on conflict (user_id) do update
      set role = excluded.role;
  end if;

  return new;
end;
$newuser$;

revoke all on function public.handle_new_user() from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- Permission check. SECURITY DEFINER avoids recursive RLS while the
-- caller identity still comes exclusively from auth.uid().
-- ---------------------------------------------------------------------
create or replace function public.is_admin_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $manager$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.role = 'super_admin'
  );
$manager$;

revoke all on function public.is_admin_manager() from public, anon;
grant execute on function public.is_admin_manager() to authenticated, service_role;

-- ---------------------------------------------------------------------
-- Paginated manager-only list. It joins auth.users only after narrowing
-- to admin_users, so the dashboard never downloads unrelated accounts.
-- ---------------------------------------------------------------------
create or replace function public.admin_management_list(
  p_limit integer default 25,
  p_offset integer default 0,
  p_query text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $list$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_query text := nullif(btrim(coalesce(p_query, '')), '');
  v_result jsonb;
begin
  if not public.is_admin_manager() then
    raise exception 'Administrator management permission is required.'
      using errcode = '42501';
  end if;

  with filtered as (
    select
      au.user_id,
      coalesce(p.full_name, nullif(btrim(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')), '')) as full_name,
      u.email,
      au.role,
      u.created_at,
      u.invited_at,
      u.confirmed_at,
      u.last_sign_in_at,
      u.banned_until
    from public.admin_users au
    join auth.users u on u.id = au.user_id
    left join public.profiles p on p.id = au.user_id
    where v_query is null
       or coalesce(p.full_name, u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '') ilike '%' || v_query || '%'
       or coalesce(u.email, '') ilike '%' || v_query || '%'
  ), paged as (
    select *
    from filtered
    order by created_at desc, email asc
    limit v_limit
    offset v_offset
  )
  select jsonb_build_object(
    'items', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'userId', p.user_id,
            'fullName', p.full_name,
            'email', p.email,
            'role', p.role,
            'createdAt', p.created_at,
            'invitedAt', p.invited_at,
            'confirmedAt', p.confirmed_at,
            'lastSignInAt', p.last_sign_in_at,
            'bannedUntil', p.banned_until
          )
          order by p.created_at desc, p.email asc
        )
        from paged p
      ),
      '[]'::jsonb
    ),
    'total', (select count(*) from filtered)
  ) into v_result;

  return v_result;
end;
$list$;

revoke all on function public.admin_management_list(integer, integer, text) from public, anon;
grant execute on function public.admin_management_list(integer, integer, text) to authenticated;

-- ---------------------------------------------------------------------
-- Prepare a requested administrator. Existing confirmed users are
-- promoted immediately; a new address is allowlisted before Supabase
-- creates the invited Auth user, so the signup trigger grants the role
-- in the same database transaction as that Auth insert.
-- ---------------------------------------------------------------------
create or replace function public.prepare_admin_invite(
  p_email text,
  p_full_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $prepare$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_name text := btrim(coalesce(p_full_name, ''));
  v_user auth.users%rowtype;
begin
  if not public.is_admin_manager() then
    raise exception 'Administrator management permission is required.'
      using errcode = '42501';
  end if;

  if v_email = '' or length(v_email) > 254 then
    raise exception 'A valid email address is required.' using errcode = '22023';
  end if;

  select * into v_user
  from auth.users
  where lower(email) = v_email
  order by created_at asc
  limit 1;

  if v_user.id is not null then
    if exists (select 1 from public.admin_users where user_id = v_user.id) then
      return jsonb_build_object('outcome', 'duplicate', 'userId', v_user.id);
    end if;

    if v_user.confirmed_at is null then
      return jsonb_build_object('outcome', 'existing_unconfirmed', 'userId', v_user.id);
    end if;

    insert into public.admin_allowlist (email, note, role)
    values (v_email, 'Administrator created from the Careers dashboard', 'admin')
    on conflict (email) do update
      set note = excluded.note,
          role = 'admin';

    insert into public.admin_users (user_id, role)
    values (v_user.id, 'admin')
    on conflict (user_id) do nothing;

    update public.profiles
       set full_name = coalesce(full_name, nullif(v_name, '')),
           updated_at = now()
     where id = v_user.id;

    return jsonb_build_object('outcome', 'promoted_existing', 'userId', v_user.id);
  end if;

  insert into public.admin_allowlist (email, note, role)
  values (v_email, 'Administrator invited from the Careers dashboard', 'admin')
  on conflict (email) do update
    set note = excluded.note,
        role = 'admin';

  return jsonb_build_object('outcome', 'needs_invite');
end;
$prepare$;

revoke all on function public.prepare_admin_invite(text, text) from public, anon;
grant execute on function public.prepare_admin_invite(text, text) to authenticated;

-- Roll back the privilege side of a failed invitation. The Auth user is
-- removed separately by the server only when it was created by the same
-- request. This function is service-role-only so rollback still works if
-- the manager's browser session expires after preparation.
create or replace function public.cancel_admin_invite(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $cancel$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  delete from public.admin_users au
  using auth.users u
  where au.user_id = u.id
    and lower(u.email) = v_email
    and au.role <> 'super_admin';

  delete from public.admin_allowlist
  where email = v_email
    and role <> 'super_admin';
end;
$cancel$;

revoke all on function public.cancel_admin_invite(text) from public, anon, authenticated;
grant execute on function public.cancel_admin_invite(text) to service_role;

-- Revoke role access without deleting the Auth user, profile or any
-- candidate records. Self-revocation and manager revocation are refused.
create or replace function public.revoke_admin_access(p_target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $revoke$
declare
  v_actor uuid := (select auth.uid());
  v_target_role text;
  v_target_email text;
begin
  if not public.is_admin_manager() then
    raise exception 'Administrator management permission is required.'
      using errcode = '42501';
  end if;

  if p_target_user_id = v_actor then
    raise exception 'You cannot revoke your own administrator access.'
      using errcode = 'P0001';
  end if;

  select au.role, lower(u.email)
    into v_target_role, v_target_email
    from public.admin_users au
    join auth.users u on u.id = au.user_id
   where au.user_id = p_target_user_id;

  if v_target_role is null then
    return false;
  end if;

  if v_target_role = 'super_admin' then
    raise exception 'Admin Manager access cannot be revoked here.'
      using errcode = 'P0001';
  end if;

  delete from public.admin_users where user_id = p_target_user_id;
  delete from public.admin_allowlist where email = v_target_email;
  return true;
end;
$revoke$;

revoke all on function public.revoke_admin_access(uuid) from public, anon;
grant execute on function public.revoke_admin_access(uuid) to authenticated;
