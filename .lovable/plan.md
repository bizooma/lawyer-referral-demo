# Plan: Create `about.md`

Write a comprehensive `about.md` at the project root that documents everything the Lawyer Referral Program platform currently does. This is a documentation-only change — no code edits.

## Structure

1. **Overview** — What the platform is (white-label SaaS for bar associations to run lawyer referral programs), target users (bar associations, intake staff, attorneys, clients), and the domain (lawyerreferralprogram.com).

2. **Architecture** — Vite + React + TS + Tailwind + shadcn/ui frontend; Lovable Cloud (Supabase) backend with Postgres + RLS, Auth, Storage, Edge Functions. Multi-tenant via `organization_id` on every tenant-scoped table, gated by `is_org_member()` / `has_role()`.

3. **Marketing site (`/`)** — Home, Features, How It Works, Pricing, Deployment, Ethics, Contact pages. SEO/AEO optimization, structured data, sitemap, Bizooma footer branding.

4. **Demo experience (`/demo/*`)** — Shared seeded Demo Organization, simulated `DemoAuthContext` (localStorage), persistent DEMO MODE banner. Covers:
   - Staff portal: Dashboard, Intake Wizard, Matching, Attorney Directory, Reports, Settings, Guided Tour
   - Attorney portal: Signup, Dashboard, Profile, Availability, Referrals
   - Client portal: Public Intake, Dashboard, Profile, Referrals

5. **Production app (`/app/*`)** — Real Supabase auth (`AuthContext`), org switcher, `RequireAuth` guard. Pages:
   - Dashboard (live counts)
   - Attorneys management
   - Matching rules
   - Settings (branding: logo, favicon, primary/accent colors, support URL, widget intro)
   - Domains (subdomain + vanity domain management with DNS verification)

6. **Authentication (`/auth/*`)** — Email + password signup (creates user + organization), login, forgot/reset password. Roles: `program_admin`, `intake_specialist` stored in `user_roles` table.

7. **Multi-tenancy & security** — Tenant isolation model, `has_role` security-definer function, RLS policies, GRANTs, separate roles table (no privilege escalation).

8. **White-label branding** — Org-scoped logos/favicons in `org-branding` storage bucket, dynamic theming via primary color, `get_branding_by_host()` RPC for host-based branding resolution.

9. **Custom domains** — `organization_domains` table, subdomain + vanity domain support, DNS A/TXT verification flow.

10. **Matching algorithm** — Deterministic scoring on practice area, location, language, availability (referenced from existing memory).

11. **Database schema summary** — Tables: `organizations`, `profiles`, `user_roles`, `organization_domains`, `attorneys`, `intakes`, `client_profiles`, `matching_rules`, `referral_responses`, `audit_logs`.

12. **What's NOT yet built** — Phase 3 (Stripe billing), Phase 4 (real email/SMS notifications, embeddable widget, exports), Phase 5 (legal pages, launch hardening). Clear "current state vs roadmap" section.

13. **Tech stack & conventions** — Brand voice, design tokens (semantic only), file/route conventions.

## Output

Single file: `about.md` at project root, ~300–500 lines of markdown, no code changes.
