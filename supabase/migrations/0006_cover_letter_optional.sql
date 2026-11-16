-- =====================================================================
-- Siddiona Careers - 0006 cover letter becomes optional
--
-- 0001 made `applications.cover_letter` NOT NULL with a 40-8000
-- character check. It is now optional with no length rule.
--
-- This is a new migration rather than an edit to 0001, because 0001 is
-- already applied to the live project and an edited file would never
-- re-run there.
--
-- There is still a practical ceiling: the application is submitted
-- through a Next.js Server Action, which caps the whole request body at
-- 1MB by default.
--
-- Idempotent: safe to run more than once.
-- =====================================================================

alter table public.applications
  alter column cover_letter drop not null;

-- The column check was declared inline, so Postgres named it. Rather
-- than assume that name, drop every CHECK constraint on this table whose
-- definition mentions cover_letter.
do $dropcheck$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.applications'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%cover_letter%'
  loop
    execute format('alter table public.applications drop constraint %I', constraint_name);
  end loop;
end
$dropcheck$;

-- Store "no cover letter" as NULL rather than an empty or whitespace-only
-- string, so the admin view can tell the two apart reliably.
update public.applications
   set cover_letter = null
 where cover_letter is not null
   and btrim(cover_letter) = '';
