
# Goal

Take the existing marketing site + demo and turn it into a production SaaS that bar associations can sign up for, brand, and operate — each on their own isolated tenant, optionally on their own subdomain.

This is a multi-phase build. I recommend approving Phase 1 first, then iterating. Each phase is independently shippable.

---

## Phase 1 — Real multi-tenant foundation

Replace the simulated demo auth with real authentication and add a tenant (organization) model so each bar association's data is isolated.

**Backend (Lovable Cloud / Supabase)**
- New tables:
  - `organizations` — id, name, slug, subdomain, branding (logo URL, primary color, disclaimer text), plan tier, status, stripe_customer_id
  - `organization_members` — links `auth.users` to `organizations` with a role (`program_admin`, `intake_specialist`)
  - `app_role` enum + `user_roles` table (per the standard secure pattern — roles stored separately, `has_role()` security-definer function)
  - Add `organization_id` foreign key to every existing tenant-scoped table: `attorneys`, `clients`, `referrals`, `matching_rules`, `audit_log`, etc.
- Rewrite RLS policies on every public table so users only see rows where `organization_id` matches an org they belong to. Admin-only mutations gated by `has_role(auth.uid(), 'program_admin')`.
- GRANT statements for `authenticated` / `service_role` on every new table.
- Backfill existing seeded demo data into a single "Demo Organization" so the `/demo` experience keeps working unchanged.

**Frontend**
- Real auth pages: `/login`, `/signup` (email + password, plus Google OAuth).
- `OrganizationContext` that loads the current user's org(s) and exposes the active one.
- Replace `DemoAuthContext` consumers in staff portal (`/app/...`) with the real auth context. Keep `/demo/*` as-is, pointed at the Demo Organization, so the public demo still works.
- Org-switcher in the header for users who belong to multiple orgs.

**Acceptance**
- Two test orgs can be created. Each sees only its own attorneys/referrals/rules. The `/demo` URLs still work exactly as today.

---

## Phase 2 — White-label branding & custom domains

Make each org's portal feel like *their* product.

- **Branding settings** (per org, admin-editable):
  - Org name, logo upload (Supabase Storage bucket `org-branding`)
  - Primary / accent colors → applied at runtime by injecting CSS variables (`--primary`, `--accent`) into the theme on app boot
  - Custom legal disclaimer, contact email, contact phone
  - Optional favicon
- **Custom subdomain support** (`referrals.countybar.org`):
  - Add a `domains` table with `organization_id`, `hostname`, `verification_status`
  - Resolve the active org on app boot from `window.location.hostname` (lookup → `organizations` by `subdomain` or `domains.hostname`)
  - DNS setup instructions in the admin UI (CNAME to a wildcard host)
  - Document the SSL/wildcard cert step (Lovable's published-domain feature covers `*.lawyerreferralprogram.com` automatically; true vanity domains require a reverse proxy or platform feature)
- **Public intake portal** at the org's subdomain — same look as the demo's client intake, but themed and scoped to that org's attorneys.

**Acceptance**
- An admin uploads a logo, changes the primary color, and the public intake portal + staff app re-render with that branding without a deploy.

---

## Phase 3 — Real billing (subscription tiers)

Wire the Pricing page tiers to actual subscriptions.

- Stripe integration (Lovable's Stripe connector).
- Three products matching the existing tiers: Local Bar, Regional Bar, Statewide.
- Enforce tier limits server-side (e.g., attorney count cap on Local Bar) via a database trigger + a `plan_limits` table.
- Self-serve checkout from `/pricing` → "Start Free Trial" → creates the org + Stripe customer + 14-day trial.
- Billing page in admin: current plan, usage, invoices, upgrade/downgrade, payment method.
- Webhook handler (edge function) for `customer.subscription.updated`, `invoice.payment_failed`, etc. → updates `organizations.status`.

**Acceptance**
- A new visitor can sign up from the Pricing page, enter a card, get a working org, and see their subscription in the billing page.

---

## Phase 4 — Make the "fully managed" promises real

The marketing site promises features that today only exist as demo UI. Pick what to build first:

- **Real notifications**: outbound email via Resend (referral sent, attorney assigned, daily digest); SMS via Twilio (urgent intake alert). Per-org from-address.
- **Embeddable widget**: actually build `widget.lawyerreferralprogram.com/embed.js` — a tiny standalone bundle that mounts the public intake form into any host site, scoped by `orgId`.
- **Audit log**: it already exists in the demo schema; promote it to real, append-only, with a viewer screen for admins.
- **Reports / exports**: CSV/PDF export of referrals for the compliance reports the marketing site advertises.

---

## Phase 5 — Cleanup & launch prep

- Update marketing copy where it implies things that don't exist yet (e.g., the embed code on `/deployment` says "demonstration example" today — keep that disclaimer until Phase 4 ships the real widget).
- Add a real Privacy Policy, Terms of Service, and Accessibility statement (currently `#` links in the footer).
- Verify the `mem://` notes say "Lovable Cloud (Supabase) + Tailwind" — the memory currently says "Next.js," but this project is actually Vite + React. I'll update the memory as part of Phase 1.
- Security scan + RLS audit pass before going live.

---

## Technical notes

- Stack stays as-is: Vite + React + TypeScript + Tailwind + shadcn, with Lovable Cloud (Supabase) for auth, database, storage, and edge functions.
- All new tables in `public` schema get explicit GRANTs + RLS policies in the same migration.
- Roles via the standard `app_role` enum + `user_roles` table + `has_role()` security-definer function — never stored on a profile row.
- The existing `/demo/*` experience is preserved as a "Demo Organization" so the marketing site's "Try the Demo" CTA keeps working throughout.

---

## What I need from you to start

1. Confirm you want to proceed with **Phase 1** first (real auth + multi-tenancy). It's the unblocker for everything else and is a meaningful chunk of work on its own.
2. Confirm the auth methods: **email/password + Google OAuth** by default — say if you want anything else (Microsoft, magic link, etc.).
3. For Phase 2, confirm the white-label model: **subdomain on `lawyerreferralprogram.com`** (e.g., `countybar.lawyerreferralprogram.com`) is straightforward; **true vanity domains** (`referrals.countybar.org`) need extra infrastructure — okay to defer?

