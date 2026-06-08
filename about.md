# Lawyer Referral Program — About

A white-label SaaS platform that lets bar associations run a modern lawyer referral program: take in client requests, match them to qualified attorneys, send referrals, and track outcomes — all under their own brand and (optionally) their own domain.

**Live domain:** [lawyerreferralprogram.com](https://lawyerreferralprogram.com)
**Built and operated by:** Bizooma — joe@bizooma.com · 904-295-6670

---

## 1. Who it's for

- **Bar associations** (local, regional, statewide) that want to operate a referral program without buying or building bespoke software.
- **Program admins** who manage attorneys, matching rules, branding, and reporting.
- **Intake specialists** who take calls and create referrals.
- **Attorneys** who receive matched referrals and manage their availability.
- **Members of the public** who need a lawyer and submit an intake through the bar's branded portal.

---

## 2. Architecture at a glance

- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS v3 + shadcn/ui.
- **Backend:** Lovable Cloud (Supabase) — Postgres with Row-Level Security, Supabase Auth, Storage, and Edge Functions.
- **Multi-tenancy:** every tenant-scoped table has an `organization_id` column. Access is gated by two SECURITY DEFINER functions:
  - `is_org_member(org_id)` — does the current user belong to this org?
  - `has_role(user_id, role)` — does the user hold a specific app role?
- **Roles:** stored in a separate `user_roles` table (never on profiles) using an `app_role` enum (`program_admin`, `intake_specialist`) to prevent privilege escalation.
- **Design system:** semantic tokens only (`--primary`, `--background`, etc.) — no raw color classes in components.

---

## 3. The public marketing site (`/`)

Marketing pages live under `/` and use `MarketingLayout` with a shared nav and footer:

| Route | Purpose |
|---|---|
| `/` | Home — value prop, social proof, CTAs |
| `/features` | Feature breakdown |
| `/how-it-works` | Workflow walkthrough |
| `/pricing` | Three tiers: Local Bar, Regional Bar, Statewide |
| `/deployment` | Embed snippet + integration guidance |
| `/ethics` | ABA compliance posture |
| `/contact` | Contact form (routes to Bizooma) |

Highly optimized for **Voice SEO and AEO**: structured data (JSON-LD), semantic HTML, single H1 per page, optimized titles/meta descriptions, sitemap.xml, robots.txt, lazy-loaded images, and Core Web Vitals tuning.

---

## 4. The demo experience (`/demo/*`)

A fully interactive sandbox shared by everyone who clicks "Try the Demo" — backed by a permanent seeded **Demo Organization** (`is_demo=true`).

- **Auth is simulated** via `DemoAuthContext` and `localStorage` — no real signup required.
- A persistent **DEMO MODE banner** is always visible.
- Three demo personas, each with their own portal:

### Staff portal (`/demo/dashboard` etc.)
- **Dashboard** — live counts of intakes by status.
- **Intake Wizard** — multi-step form to capture a new client matter.
- **Matching** — runs the scoring algorithm and shows ranked attorneys with a one-click "Send Referral" action.
- **Attorney Directory** — searchable/filterable list of panel attorneys.
- **Reports** — charts for referral volume, geographic spread, and attorney performance.
- **Settings** — org branding and matching rule weights.
- **Guided Tour** — step-by-step walkthrough that tracks visited sections.

### Attorney portal (`/demo/attorney/*`)
- Signup, dashboard, profile, availability toggles, and referrals list (accept / decline / mark closed).

### Client portal (`/demo/client/*`)
- Public intake form, client dashboard, profile, and a referrals view showing which attorney they were matched to.

The demo is read-mostly and self-resetting in spirit — it exists to showcase functionality without exposing any real data.

---

## 5. The production app (`/app/*`)

The real, multi-tenant SaaS. Protected by `RequireAuth` and powered by the real `AuthContext` (Supabase Auth + memberships + active-org selection persisted to `localStorage`).

| Route | Purpose |
|---|---|
| `/app/dashboard` | Live counts scoped to the active organization |
| `/app/attorneys` | Add, edit, and manage panel attorneys |
| `/app/matching` | Toggle and tune matching rules |
| `/app/settings` | Org name, logo, favicon, primary/accent colors, support URL, widget intro text |
| `/app/domains` | Add subdomains (`countybar.lawyerreferralprogram.com`) and vanity domains with DNS A/TXT verification |

The sidebar includes an **organization switcher** for users who belong to multiple orgs and dynamically reflects the active org's logo + primary color.

---

## 6. Authentication (`/auth/*`)

Real Supabase Auth using **email + password**:

- `/auth/signup` — creates the user, creates their organization, and assigns them the `program_admin` role in a single flow.
- `/auth/login` — standard sign-in.
- `/auth/forgot-password` and `/auth/reset-password` — password reset over email.

Roles are written to `user_roles` only — never on `profiles`.

---

## 7. Multi-tenancy & security model

Every tenant-scoped row carries `organization_id`. RLS policies on every public table follow this pattern:

```sql
USING (public.is_org_member(organization_id))
WITH CHECK (public.is_org_member(organization_id))
```

Admin-only mutations additionally require `public.has_role(auth.uid(), 'program_admin')`.

Every new public-schema table includes explicit `GRANT` statements for `authenticated` and `service_role` (PostgREST won't reach a table without them, regardless of RLS).

---

## 8. White-label branding

Each org controls how their portal looks:

- **Assets:** logos and favicons uploaded to the `org-branding` Supabase Storage bucket. Upload policies restrict admins to their own org's folder.
- **Colors:** primary and accent colors stored on `organizations`, applied at runtime by injecting CSS variables.
- **Copy:** custom support URL and widget intro text.
- **Host-aware branding:** the `get_branding_by_host(text)` RPC resolves an organization's branding from a hostname — used by the embeddable widget and the public intake portal.

---

## 9. Custom domains

The `organization_domains` table supports two hostname types per org:

- **Subdomains** on `lawyerreferralprogram.com` (covered by the platform wildcard cert).
- **Vanity domains** (e.g. `referrals.countybar.org`).

The Domains screen walks admins through the required **A** and **TXT** DNS records and reports verification status.

---

## 10. Matching algorithm

Deterministic, weighted scoring across:

- **Practice area** match (must-have)
- **Location / jurisdiction** proximity
- **Language** capability
- **Availability** (currently accepting referrals + capacity)

Weights are stored in `matching_rules` per organization and tunable from the Matching screen. The algorithm returns a ranked list; the highest score is highlighted as the recommended match.

---

## 11. Database (key tables)

- `organizations` — name, slug, branding (logo, favicon, primary/accent colors), plan_tier, status, `is_demo`
- `profiles` — minimal per-user profile
- `user_roles` — `(user_id, organization_id, role)` with `app_role` enum
- `organization_domains` — hostnames + verification status
- `attorneys` — panel members
- `intakes` — client matters
- `client_profiles` — public intake submitters
- `matching_rules` — per-org scoring weights
- `referral_responses` — attorney accept/decline outcomes
- `audit_logs` — append-only activity record

---

## 12. Current state vs roadmap

### Shipped (Phases 1–2)
- Real multi-tenant auth and database with RLS
- `/app/*` admin portal
- White-label branding (logo, favicon, colors, copy)
- Subdomain + vanity domain management
- `/demo/*` preserved as a permanent showcase

### Not yet built
- **Phase 3 — Billing:** Stripe self-serve checkout from `/pricing`, plan-limit enforcement, billing portal, webhook handling.
- **Phase 4 — Make marketing promises real:** transactional email (Resend) + SMS (Twilio), embeddable widget bundle (`embed.js`), full audit-log viewer, CSV/PDF exports.
- **Phase 5 — Launch prep:** real Privacy Policy / Terms / Accessibility pages, security audit pass, marketing copy reconciliation.

---

## 13. Conventions

- **Brand voice:** Navy/slate civic-tech aesthetic; clean sans-serif; professional, trust-forward.
- **Design tokens:** semantic only — never `text-white`, `bg-black`, etc. in components.
- **Routing:** marketing under `/`, demo under `/demo/*`, auth under `/auth/*`, real app under `/app/*`.
- **Backend client:** `import { supabase } from "@/integrations/supabase/client"` — never edit the generated client or types.
- **Footer attribution:** "Powered by Bizooma" with contact details.
