-- Add approval states in their own migration. PostgreSQL requires newly
-- added enum values to commit before a later migration can use them in
-- policies, functions, constraints, or data changes.

alter type public.job_status add value if not exists 'pending_approval';
alter type public.job_status add value if not exists 'changes_requested';
