# Siddiona Careers - setup

Everything the careers feature needs that cannot live in the repository:
the database schema, the Google OAuth client, the storage bucket and the
mail provider.

Work through it in order. Steps 1 to 3 are enough to browse, apply and
run the admin console locally. Sign-up confirmation and password reset
emails need step 4, and step 4b needs a deployed URL.

---

## 1. Environment variables

Copy the template and fill it in:

```bash
cp .env.local.example .env.local
```

| Variable | Where it comes from | Exposed to the browser |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard, Project Settings > API | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page, the publishable key | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | same page, the secret key | **no** |
| `NEXT_PUBLIC_SITE_URL` | your canonical origin, no trailing slash | yes |
| `RESEND_API_KEY` | resend.com/api-keys | **no** |
| `CAREERS_FROM_EMAIL` | an address on a domain verified in Resend | no |
| `CAREERS_NOTIFICATION_EMAIL` | who gets new-application alerts | no |
| `SUPABASE_AUTH_HOOK_SECRET` | Supabase dashboard, Authentication > Hooks > Send Email (see section 4b) | **no** |

The service role key bypasses Row Level Security completely. It is
reachable only from `src/lib/supabase/admin.ts`, which starts with
`import "server-only"` so the build fails rather than shipping it to a
browser. Never add a `NEXT_PUBLIC_` prefix to it.

`.env.local` is already gitignored.

---

## 2. Database

Run the migration files in order, from
`supabase/migrations/`.

**Via the dashboard:** open the SQL Editor, paste the contents of each
file, run it, move to the next.

**Via the CLI:**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

| File | What it does |
|---|---|
| `0001_careers_schema.sql` | Extensions, enums, tables, indexes, the application reference generator |
| `0002_careers_rls.sql` | `is_admin()`, every policy, narrowed table grants |
| `0003_careers_triggers.sql` | Signup trigger, update guards, event logging, admin allowlist seed, backfill |
| `0004_careers_storage.sql` | The private `resumes` bucket and its storage policies |
| `0005_careers_seed.sql` | Four published example roles |
| `0006_cover_letter_optional.sql` | Makes the cover letter optional, with no length rule |
| `0007_application_attribution.sql` | Stores first-touch and latest-touch attribution with applications |
| `0008_add_sales_admin.sql` | Allow-lists Sales and promotes an existing matching account |
| `0009_admin_query_performance.sql` | Paginated admin reporting RPCs and dashboard query aggregation |
| `0010_admin_management.sql` | Manager role, role-aware allowlist, administrator list/invite/revoke RPCs |
| `0011_job_approval_status_values.sql` | Adds Pending Approval and Changes Requested job states |
| `0012_job_approval_workflow.sql` | Admin-only approval metadata, guarded lifecycle RPCs, grants, triggers, and dashboard counts |

Each file is idempotent, so re-running one is safe.

For this application revision, apply `0010_admin_management.sql`, then `0011`,
then `0012` before deploying the app. PostgreSQL must commit the enum extension
in `0011` before `0012` can use the new values. The application and its Server
Actions depend on the role-aware schema and approval RPCs; deploying them
against the previous schema is not a supported intermediate state.

### Admin access

`0003` contains the original administrator seed. `0008` adds
`sales@example.com`; `0010` promotes that allowlist/account to the sole
`super_admin` Admin Manager and keeps `info@example.com` as an ordinary
`admin`. If the Sales account does not exist yet, sign up through the normal
careers flow and the role-aware signup trigger grants manager access.

There is no email comparison anywhere in the application code. The role
lives in `public.admin_users`, that table has no INSERT or UPDATE policy,
and every admin query is gated by the `is_admin()` security-definer
function. A signed-in user can confirm their own role and can never
grant themselves one.

After `0010` is applied, Sales manages ordinary administrators at
`/admin/admins`. New accounts receive a secure email invitation and set their
password at `/admin/setup-password`; confirmed existing accounts are promoted
without replacing their credentials. Revoking access removes the role and
allowlist entry but preserves the person's Auth account, profile, and candidate
data. Every invitation grants the ordinary `admin` role. The UI cannot create,
edit, or revoke the `super_admin` Admin Manager role, so ordinary administrators
cannot manage other administrators.

The invitation action requires `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
`CAREERS_FROM_EMAIL`, and a valid `NEXT_PUBLIC_SITE_URL`. If link generation or
delivery fails, the prepared database privilege is removed before the action
returns an error.

### Verifying the security model

Worth running once, in the SQL Editor, to see that the database refuses
what the UI refuses:

```sql
-- Every careers table should report rowsecurity = true.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles','jobs','applications','application_events',
    'application_notes','admin_users','admin_allowlist',
    'job_approval_state','email_events','rate_limits'
  );

-- application_notes, admin_allowlist, and job_approval_state should have no
-- policy that any candidate could match.
select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

---

## 3. Google OAuth

This one has to be done in your own Google account.

1. Google Cloud Console > APIs and Services > Credentials.
2. Create an OAuth 2.0 Client ID, type **Web application**.
3. Authorised redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
   Take this value from the Supabase dashboard rather than typing it, under
   Authentication > Providers > Google.
4. Copy the Client ID and Client Secret into Supabase under
   Authentication > Providers > Google, and enable the provider.
5. Supabase dashboard > Authentication > URL Configuration:
   - **Site URL:** `http://localhost:3000` for development, your production
     origin when you deploy.
   - **Redirect URLs:** add every origin the app runs on, each with the
     `/**` wildcard:
     ```
     http://localhost:3000/**
     https://siddiona.com/**
     https://siddiona-com.vercel.app/**
     ```
     Without these, Supabase refuses the redirect after a successful sign
     in and the candidate lands on an error.

The app sends `prompt=select_account`, so a shared machine always shows
the account chooser instead of silently reusing the last Google account.

---

## 4. Email

Every email the careers feature sends goes out through Resend, from this
codebase, with the same templates and the same delivery log. That includes
authentication email. Supabase's own mailer is not used at all.

| Message | Triggered by | Template |
|---|---|---|
| Confirm signup | Supabase, via the Send Email hook | `src/lib/email/auth-templates.ts` |
| Reset password | Supabase, via the Send Email hook | `src/lib/email/auth-templates.ts` |
| Email change, magic link, invite, reauthentication code | Supabase, via the Send Email hook | `src/lib/email/auth-templates.ts` |
| Security notices (password changed and similar) | Supabase, via the Send Email hook | `src/lib/email/auth-templates.ts` |
| Application received | submitting an application | `src/lib/email/templates.ts` |
| Status updated | an admin changing status | `src/lib/email/templates.ts` |
| New application, to the hiring team | submitting an application | `src/lib/email/templates.ts` |

Every attempt, sent or failed, is written to `public.email_events`.

### 4a. Resend

1. Add and verify `siddiona.com` in Resend (Domains). This means adding the
   SPF, DKIM and return-path DNS records Resend lists. Until the domain
   shows **Verified**, Resend refuses to send from `@example.com`.
2. Create an API key with **Sending access** only. The app never needs more,
   and a leaked sending key cannot read or change anything in the Resend
   account.
3. Set in `.env.local` and in the Vercel project settings:
   ```
   RESEND_API_KEY=re_...
   CAREERS_FROM_EMAIL="Siddiona Careers <careers@example.com>"
   CAREERS_NOTIFICATION_EMAIL=admin@example.com
   ```

### 4b. Hand auth email to the app (Send Email hook)

Supabase calls `POST /api/auth/send-email` whenever it needs to send an
auth email, and sends nothing itself. The endpoint verifies the request's
Standard Webhooks signature, renders the branded template, and sends it
through Resend.

**Order matters.** Supabase has to be able to reach the endpoint over the
public internet, and once the hook is enabled, *every* auth email for the
project depends on it. Enable it too early and sign-ups stop working. Follow
these steps in order:

1. **Deploy first.** Deploy the app to Vercel with every variable from
   section 1 set, including `RESEND_API_KEY` and `CAREERS_FROM_EMAIL`.
   Confirm the endpoint is live: a `GET` to
   `https://siddiona.com/api/auth/send-email` should return
   `405 Method not allowed`. A 404 means the deployment does not include it
   yet.
2. **Create the hook.** Supabase dashboard > Authentication > Hooks > Send
   Email hook > **HTTPS**.
   - URL: `https://siddiona.com/api/auth/send-email`
   - Click **Generate secret**. It looks like `v1,whsec_...`.
3. **Give the app the secret.** Set `SUPABASE_AUTH_HOOK_SECRET` to that
   value, including the `v1,whsec_` prefix, in Vercel and redeploy. The
   endpoint rejects every request until this is set.
4. **Enable the hook** in the dashboard and save.
5. **Test it:** sign up at `/careers/join` with a real inbox you control. The
   confirmation email should arrive from `careers@example.com` with the
   Siddiona design, and its link should point at
   `https://siddiona.com/auth/confirm?...`, not at `supabase.co`.

If a message does not arrive, check in this order:

- **Vercel function logs** for `[auth-hook]` lines.
  `rejected an unverified request` means the secret in Vercel does not match
  the dashboard. `not delivered` quotes Resend's reason.
- **`public.email_events`** for a `failed` row with the provider's error.
- **Resend > Emails** for bounces or blocks.

When sending fails, the endpoint returns an error to Supabase instead of
pretending it worked, so the person sees "error sending confirmation email"
at sign-up and can retry. A confirmation link that silently never arrives
leaves someone with an account they cannot use; an error they can see is
the better failure.

### "Supabase sent the email" or "the link is not valid"

**The email came from Supabase, not Siddiona.** The hook is not enabled.
When the Send Email hook is on, Supabase sends nothing itself. Check
Authentication > Hooks > Send Email: it must be **enabled** and saved, with
type HTTPS. An unsigned `POST` to the endpoint tells you whether Vercel has
the secret. `401 Invalid webhook signature` means it does;
`500 Email hook is not configured` means it does not.

**The link says it is not valid.** Every link shape is handled by
`/auth/confirm`:

| Link | What happens |
|---|---|
| Our hook's `?token_hash=...` | Opens `/careers/verify`, a confirm page. The token is spent only when the button is pressed. |
| Supabase's own `?code=...` | Exchanged for a session. If that fails, the address is already confirmed (Supabase confirms it before issuing the code), so the person is told to sign in. |
| Supabase's `?error_code=otp_expired` | The join page opens on "send me a new link". |

The confirm button on `/careers/verify` exists because corporate mail
security (Microsoft Defender Safe Links, Mimecast, Proofpoint) opens every
link in an incoming message to scan it. If opening the link spent the
token, the scanner would use it up and the person's own first click would
fail.

A `?code=` link only completes in the browser that started sign-up,
because that browser holds the PKCE verifier cookie. Hook links do not
have this limitation, which is another reason to enable the hook.

Anyone whose link failed can get a new one: the join page opens on "Get a
new confirmation link", and the "check your inbox" screen has "Send the
link again". A new link replaces the old one.

### Links in auth emails

Every link points at the app's own `/auth/confirm` handler, which verifies
the token and sets the session. The link's host is taken from `redirect_to`
only if that host matches the project **Site URL** or `NEXT_PUBLIC_SITE_URL`.
Otherwise it falls back to the Site URL. Supabase already checks
`redirect_to` against its allowlist; this second check means a loosely
configured allowlist still cannot turn a confirmation email into a link to
another site.

**Local development:** Supabase cloud cannot reach `localhost`, so the hook
always calls the deployed endpoint, and links follow the Site URL. To get
confirmation links that open `http://localhost:3000` while developing,
either set the Supabase **Site URL** to `http://localhost:3000` for that
period, or use a separate Supabase project for development. Remember to
change the Site URL back before real candidates sign up.

### Email change

The app has no email-change screen today (the profile shows the address as
read-only), but the hook handles the flow correctly if one is added later.
With **Secure email change** on, Supabase wants confirmation from both
addresses, and its token field names are reversed for backward
compatibility: the current address gets `token_hash_new` and the new address
gets `token_hash`. `src/lib/email/auth-hook.ts` follows that mapping, and it
is covered by a test.

---

## 5. Run it

```bash
npm run dev
```

| Route | What it is |
|---|---|
| `/careers` | Public landing page and the open roles index |
| `/careers/[slug]` | Job detail, with JobPosting structured data |
| `/careers/jobs/[id]` | Stable LinkedIn application link; redirects published jobs to their current slug |
| `/careers/join` | Sign in and sign up |
| `/careers/applications` | A candidate's own applications |
| `/careers/profile` | Candidate profile |
| `/admin/sign-in` | Admin sign in |
| `/admin` | Dashboard, jobs, applications, candidates |
| `/admin/admins` | Sales-only administrator list, invitations, and revocation |
| `/admin/setup-password` | Invited administrator password setup |

`/career` (singular) redirects permanently to `/careers`.

For a published, unexpired job, copy its stable LinkedIn URL from the Admin Jobs
table or the job editor and paste it into LinkedIn's external/company-website
application field. The link always uses `https://siddiona.com` and includes
`utm_source=linkedin&utm_medium=job_posting`; LinkedIn posting remains manual.
Draft, Pending Approval, Changes Requested, closed, and expired jobs do not
expose a copyable link in Admin.

Ordinary administrators can save Drafts or Submit for approval. Only the Sales
`super_admin` can publish directly, approve a Pending Approval job, or Request
changes. A changes request must include a reason. Editing a live or pending job
as an ordinary administrator returns it to Draft only when content actually
changes; saving an unchanged form preserves its current status.

Before deploying this feature, verify that
`0007_application_attribution.sql` is present in the live Supabase migration
history. Apply that existing migration if it is missing; do not create a new
LinkedIn-specific migration.

---

## How the pieces fit

**Authorization is the database's job.** Row Level Security decides every
read and write. `requireAdmin()` and `requireUser()` exist to choose where
to send a browser, not to protect data. Delete every guard in
`src/lib/auth/guards.ts` and a candidate still cannot read another
candidate's application, because Postgres refuses.

**Duplicate applications are prevented by a constraint**, not a check in
React. `UNIQUE (user_id, job_id)` on `public.applications`, plus an INSERT
policy that additionally requires the job to be published and not past its
closing date.

**Application status is protected by a trigger.** A `WITH CHECK` clause
cannot express "this column did not change", so
`applications_guard_candidate_update` forces every immutable column back
to its previous value for non-admins, and permits exactly one
candidate-initiated transition: a withdrawal from a live status.

**Internal notes live in their own table.** RLS is row-level, not
column-level, so an `admin_notes` column on `applications` would have been
readable by any candidate selecting their own row.
`public.application_notes` has admin-only policies and no candidate-facing
policy at all.

**Resumes never travel through the Next.js server.** The browser uploads
straight to Supabase Storage, because a Server Action caps its request
body at 1MB by default and a CV is routinely larger. Storage policies
restrict writes to `{auth.uid()}/`, the bucket enforces size and MIME type
server-side, and the submit action re-reads the object's real metadata
before writing the application row. Admin access is a signed URL minted at
the moment of the click, valid for 60 seconds.

**A failed email never fails an application, but a failed auth email is
reported.** Application email is best effort: `sendEmail` catches
everything, records the outcome in `public.email_events`, and the
submission stands. The auth hook works the other way round: if a
confirmation or reset email cannot be sent, it returns an error so
Supabase tells the person at the moment of sign-up, rather than leaving
them waiting for a link that is never coming.
