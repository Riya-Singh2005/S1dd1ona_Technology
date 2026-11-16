begin;

create extension if not exists pgtap with schema extensions;

select plan(15);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'manager-test@siddiona.invalid', '', now(), '{}', '{"full_name":"Manager Test"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'admin-test@siddiona.invalid', '', now(), '{}', '{"full_name":"Admin Test"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'target-test@siddiona.invalid', '', now(), '{}', '{"full_name":"Target Test"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'candidate-test@siddiona.invalid', '', now(), '{}', '{"full_name":"Candidate Test"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'second-manager-test@siddiona.invalid', '', now(), '{}', '{"full_name":"Second Manager"}', now(), now());

insert into public.admin_allowlist (email, note, role)
values
  ('manager-test@siddiona.invalid', 'test fixture', 'super_admin'),
  ('admin-test@siddiona.invalid', 'test fixture', 'admin'),
  ('target-test@siddiona.invalid', 'test fixture', 'admin'),
  ('second-manager-test@siddiona.invalid', 'test fixture', 'super_admin');

insert into public.admin_users (user_id, role)
values
  ('10000000-0000-0000-0000-000000000001', 'super_admin'),
  ('10000000-0000-0000-0000-000000000002', 'admin'),
  ('10000000-0000-0000-0000-000000000003', 'admin'),
  ('10000000-0000-0000-0000-000000000005', 'super_admin');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select throws_ok(
  $$select public.admin_management_list(25, 0, null)$$,
  '42501',
  'permission denied for function admin_management_list',
  'unauthenticated callers cannot list administrators'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select throws_ok(
  $$select public.admin_management_list(25, 0, null)$$,
  '42501',
  'Administrator management permission is required.',
  'ordinary administrators cannot list administrators'
);
select throws_ok(
  $$select public.prepare_admin_invite('blocked@siddiona.invalid', 'Blocked User')$$,
  '42501',
  'Administrator management permission is required.',
  'ordinary administrators cannot prepare invitations'
);
select throws_ok(
  $$select public.revoke_admin_access('10000000-0000-0000-0000-000000000003')$$,
  '42501',
  'Administrator management permission is required.',
  'ordinary administrators cannot revoke access'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select ok(public.is_admin_manager(), 'the manager role is recognized');
select is(
  (public.admin_management_list(25, 0, null) ->> 'total')::integer,
  4,
  'the manager can list only joined administrator records'
);
select is(
  jsonb_array_length(public.admin_management_list(25, 0, 'Admin Test') -> 'items'),
  1,
  'name search is applied on the server'
);
select is(
  jsonb_array_length(public.admin_management_list(25, 0, 'candidate-test') -> 'items'),
  0,
  'non-admin Auth users never appear in the list'
);
select throws_ok(
  $$select public.revoke_admin_access('10000000-0000-0000-0000-000000000001')$$,
  'P0001',
  'You cannot revoke your own administrator access.',
  'self revocation is refused'
);
select throws_ok(
  $$select public.revoke_admin_access('10000000-0000-0000-0000-000000000005')$$,
  'P0001',
  'Admin Manager access cannot be revoked here.',
  'manager access is protected'
);
select ok(
  public.revoke_admin_access('10000000-0000-0000-0000-000000000003'),
  'the manager can revoke an ordinary administrator'
);

reset role;
select is(
  (select count(*)::integer from public.admin_users where user_id = '10000000-0000-0000-0000-000000000003'),
  0,
  'revocation removes the administrator role'
);
select is(
  (select count(*)::integer from public.admin_allowlist where email = 'target-test@siddiona.invalid'),
  0,
  'revocation removes the allowlist record'
);
select is(
  (select count(*)::integer from auth.users where id = '10000000-0000-0000-0000-000000000003'),
  1,
  'revocation preserves the Auth user'
);

insert into public.admin_allowlist (email, note, role)
values ('rollback-test@siddiona.invalid', 'test fixture', 'admin');
set local role service_role;
select public.cancel_admin_invite('rollback-test@siddiona.invalid');
reset role;
select is(
  (select count(*)::integer from public.admin_allowlist where email = 'rollback-test@siddiona.invalid'),
  0,
  'failed invitation rollback removes prepared privilege'
);

select * from finish();
rollback;
