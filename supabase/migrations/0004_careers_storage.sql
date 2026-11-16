-- =====================================================================
-- Siddiona Careers - 0004 resume storage
--
-- Bucket layout is {auth.uid()}/{uuid}.{ext}, so the first path segment
-- identifies the owner and every policy keys off it.
--
-- The bucket's own file_size_limit and allowed_mime_types are the real
-- validation boundary: Supabase enforces them server-side, before a
-- single byte reaches application code. Client-side checks are only
-- there to give a fast, friendly error.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880, -- 5 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------
-- A candidate may write only inside their own folder.
-- ---------------------------------------------------------------------
drop policy if exists "resumes_insert_own" on storage.objects;
create policy "resumes_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Replacing a previous upload before submitting is legitimate.
drop policy if exists "resumes_update_own" on storage.objects;
create policy "resumes_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---------------------------------------------------------------------
-- Reads: the owner, or an admin. There is no public policy, so a resume
-- is never retrievable without a session or a server-signed URL.
-- ---------------------------------------------------------------------
drop policy if exists "resumes_read_own_or_admin" on storage.objects;
create policy "resumes_read_own_or_admin"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );

-- ---------------------------------------------------------------------
-- A candidate may delete an upload they have not yet attached to a
-- submitted application. Once an application references the file, the
-- evidence stays put.
-- ---------------------------------------------------------------------
drop policy if exists "resumes_delete_own_unsubmitted" on storage.objects;
create policy "resumes_delete_own_unsubmitted"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (
      select 1
      from public.applications a
      where a.resume_path = storage.objects.name
    )
  );
