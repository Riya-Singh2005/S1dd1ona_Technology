begin;

create extension if not exists pgtap with schema extensions;

select plan(25);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'approval-manager@siddiona.invalid', '', now(), '{}', '{"full_name":"Approval Manager"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'approval-admin@siddiona.invalid', '', now(), '{}', '{"full_name":"Approval Admin"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'approval-candidate@siddiona.invalid', '', now(), '{}', '{"full_name":"Approval Candidate"}', now(), now());

insert into public.admin_users (user_id, role)
values
  ('12000000-0000-0000-0000-000000000001', 'super_admin'),
  ('12000000-0000-0000-0000-000000000002', 'admin');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select throws_ok(
  $$insert into public.jobs (title, slug, department, location, short_description, description) values ('Anon role', 'approval-anon', 'Tech', 'Remote', 'A valid summary.', 'A valid description.')$$,
  '42501',
  'permission denied for table jobs',
  'anonymous users cannot create jobs'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000003', true);
select throws_ok(
  $$insert into public.jobs (title, slug, department, location, short_description, description) values ('Candidate role', 'approval-candidate', 'Tech', 'Remote', 'A valid summary.', 'A valid description.')$$,
  '42501',
  'Administrator access is required.',
  'candidates cannot create jobs'
);

select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000002', true);
select lives_ok(
  $$insert into public.jobs (title, slug, department, location, short_description, description, status) values ('Draft role', 'approval-draft', 'Tech', 'Remote', 'A valid summary.', 'A valid description.', 'draft')$$,
  'ordinary administrators can create drafts'
);
select is(
  (select created_by from public.jobs where slug = 'approval-draft'),
  '12000000-0000-0000-0000-000000000002'::uuid,
  'creator identity is stamped from auth.uid()'
);
select throws_ok(
  $$insert into public.jobs (title, slug, department, location, short_description, description, status) values ('Forged publish', 'approval-forged', 'Tech', 'Remote', 'A valid summary.', 'A valid description.', 'published')$$,
  '42501',
  'Super Admin approval is required before publishing.',
  'ordinary administrators cannot insert published jobs'
);
select throws_ok(
  $$update public.jobs set status = 'published' where slug = 'approval-draft'$$,
  '42501',
  'permission denied for table jobs',
  'ordinary administrators cannot directly update lifecycle columns'
);
select lives_ok(
  $$insert into public.jobs (title, slug, department, location, short_description, description, status) values ('Pending role', 'approval-pending', 'Tech', 'Remote', 'A valid summary.', 'A valid description.', 'pending_approval')$$,
  'ordinary administrators can atomically create pending submissions'
);
select is(
  (select a.submitted_by from public.job_approval_state a join public.jobs j on j.id = a.job_id where j.slug = 'approval-pending'),
  '12000000-0000-0000-0000-000000000002'::uuid,
  'submitter identity is server-derived'
);
select throws_ok(
  $$select public.review_job_submission((select id from public.jobs where slug = 'approval-pending'), 'approve', null)$$,
  '42501',
  'Super Admin approval permission is required.',
  'ordinary administrators cannot approve submissions'
);
select throws_ok(
  $$select public.review_job_submission((select id from public.jobs where slug = 'approval-pending'), 'changes_requested', 'Needs work')$$,
  '42501',
  'Super Admin approval permission is required.',
  'ordinary administrators cannot request changes'
);

select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000001', true);
select is(
  public.review_job_submission((select id from public.jobs where slug = 'approval-pending'), 'approve', null),
  'published'::public.job_status,
  'the Super Admin can approve and publish'
);
select is(
  (select a.reviewed_by from public.job_approval_state a join public.jobs j on j.id = a.job_id where j.slug = 'approval-pending'),
  '12000000-0000-0000-0000-000000000001'::uuid,
  'reviewer identity is server-derived'
);
select throws_ok(
  $$select public.review_job_submission((select id from public.jobs where slug = 'approval-pending'), 'approve', null)$$,
  'P0001',
  'This job is no longer pending approval. Refresh and review its current status.',
  'a repeated review of an approved submission fails safely'
);

select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000002', true);
select lives_ok(
  $$insert into public.jobs (title, slug, department, location, short_description, description, status) values ('Needs changes', 'approval-changes', 'Tech', 'Remote', 'A valid summary.', 'A valid description.', 'pending_approval')$$,
  'a second pending submission can be created'
);
select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000001', true);
select throws_ok(
  $$select public.review_job_submission((select id from public.jobs where slug = 'approval-changes'), 'changes_requested', '   ')$$,
  '22023',
  'Enter a reason between 1 and 2000 characters.',
  'requesting changes requires a reason'
);
select is(
  public.review_job_submission((select id from public.jobs where slug = 'approval-changes'), 'changes_requested', '  Add the salary range.  '),
  'changes_requested'::public.job_status,
  'the Super Admin can request changes'
);
select is(
  (select a.review_reason from public.job_approval_state a join public.jobs j on j.id = a.job_id where j.slug = 'approval-changes'),
  'Add the salary range.',
  'the review reason is trimmed and stored'
);

select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000002', true);
update public.jobs set title = 'Published role edited' where slug = 'approval-pending';
select is(
  (select status from public.jobs where slug = 'approval-pending'),
  'draft'::public.job_status,
  'ordinary-admin edits return published jobs to draft'
);
select is(
  (select status from public.jobs where slug = 'approval-changes'),
  'changes_requested'::public.job_status,
  'edits preserve changes requested and its reason'
);
select is(
  public.submit_job_for_approval((select id from public.jobs where slug = 'approval-changes')),
  'pending_approval'::public.job_status,
  'a changes-requested job can be resubmitted'
);
update public.jobs set title = title where slug = 'approval-changes';
select is(
  (select status from public.jobs where slug = 'approval-changes'),
  'pending_approval'::public.job_status,
  'a no-op save preserves pending approval'
);
update public.jobs set title = 'Pending role edited' where slug = 'approval-changes';
select is(
  (select status from public.jobs where slug = 'approval-changes'),
  'draft'::public.job_status,
  'a real pending-job edit returns it to draft'
);

select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000001', true);
select throws_ok(
  $$select public.review_job_submission((select id from public.jobs where slug = 'approval-changes'), 'approve', null)$$,
  'P0001',
  'This job is no longer pending approval. Refresh and review its current status.',
  'stale review attempts fail safely'
);

reset role;
insert into public.jobs (title, slug, department, location, short_description, description, status)
values ('Existing public role', 'approval-public', 'Tech', 'Remote', 'A valid summary.', 'A valid description.', 'published');
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select is(
  (select count(*)::integer from public.jobs where slug = 'approval-public'),
  1,
  'published jobs remain publicly readable'
);
select throws_ok(
  $$select * from public.job_approval_state$$,
  '42501',
  'permission denied for table job_approval_state',
  'approval metadata is unreadable publicly'
);

select * from finish();
rollback;
