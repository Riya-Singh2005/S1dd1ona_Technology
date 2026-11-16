-- Add the Sales mailbox to the careers administrator allowlist.
-- Existing accounts are promoted immediately; future accounts are promoted
-- by public.handle_new_user() when they sign up.

insert into public.admin_allowlist (email, note)
values ('sales@example.com', 'Sales administrator')
on conflict (email) do update
set note = excluded.note;

insert into public.admin_users (user_id)
select u.id
from auth.users u
where lower(u.email) = 'sales@example.com'
on conflict (user_id) do nothing;
