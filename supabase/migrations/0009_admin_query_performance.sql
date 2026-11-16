-- Admin list and dashboard summaries without downloading unbounded rows.
-- Migration Applied on  15:05 16 October, 2026
-- Both functions use the caller's privileges/RLS and explicitly reject
-- non-admin sessions before reading any aggregate data.

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

create or replace function public.admin_candidate_summaries(
  p_limit integer default 25,
  p_offset integer default 0
)
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

  with candidates as (
    select
      user_id,
      (array_agg(full_name order by created_at desc))[1] as full_name,
      (array_agg(email order by created_at desc))[1] as email,
      (array_agg(phone order by created_at desc))[1] as phone,
      count(*) as applications,
      max(created_at) as latest_at
    from public.applications
    group by user_id
  ),
  page as (
    select *
    from candidates
    order by latest_at desc
    limit least(greatest(coalesce(p_limit, 25), 1), 100)
    offset greatest(coalesce(p_offset, 0), 0)
  )
  select jsonb_build_object(
    'total', (select count(*) from candidates),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'userId', user_id,
        'fullName', full_name,
        'email', email,
        'phone', phone,
        'applications', applications,
        'latestAt', latest_at
      ) order by latest_at desc)
      from page
    ), '[]'::jsonb)
  )
  into result;

  return result;
end;
$$;

revoke all on function public.admin_dashboard_stats() from public, anon;
revoke all on function public.admin_candidate_summaries(integer, integer) from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;
grant execute on function public.admin_candidate_summaries(integer, integer) to authenticated;
