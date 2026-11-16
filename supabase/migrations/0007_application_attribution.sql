-- Optional marketing attribution captured at application submission.
-- Existing rows remain valid and intentionally retain NULL values.
alter table public.applications
  add column if not exists first_touch_attribution jsonb,
  add column if not exists last_touch_attribution jsonb;

comment on column public.applications.first_touch_attribution is
  'Sanitized first-touch campaign attribution captured by the careers site.';
comment on column public.applications.last_touch_attribution is
  'Sanitized most-recent eligible campaign attribution captured by the careers site.';
