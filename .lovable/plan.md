
The user wants to replace the placeholder screenshots on the `/features` page with actual screenshots from the demo environment. Let me check what demo pages map to each feature section.

The 6 main features on the page:
1. **Intake Dashboard** → `/demo/dashboard`
2. **Attorney Directory** → `/demo/attorneys`
3. **Matching Rules Engine** → `/demo/matching`
4. **Payment Logging** → likely part of intake or reports
5. **Reporting & Export** → `/demo/reports`
6. **Audit Trail** → likely part of reports or settings

## Plan

**Step 1: Capture demo screenshots**
Use the browser tool to navigate to each demo page and capture screenshots:
- `/demo/dashboard` → Intake Dashboard
- `/demo/attorneys` (AttorneyDirectory) → Attorney Directory
- `/demo/matching` → Matching Rules Engine
- `/demo/intake` (IntakeWizard, payment step) → Payment Logging
- `/demo/reports` → Reporting & Export
- `/demo/settings` or reports activity view → Audit Trail

Save each as a PNG into `public/demo-screenshots/` (e.g., `dashboard.png`, `attorneys.png`, `matching.png`, `payments.png`, `reports.png`, `audit.png`).

**Step 2: Update `src/pages/Features.tsx`**
- Add an `image` field to each entry in the `features` array pointing to its screenshot path.
- Replace the placeholder `<Card>` block (currently showing "Feature screenshot placeholder") with the `LazyImage` component (already exists in `src/components/ui/lazy-image.tsx`) wrapped in a styled Card with the macOS-style frame for polish.
- Use proper alt text for accessibility/SEO (e.g., "Intake dashboard screenshot showing referral queue").
- Keep the alternating left/right layout intact.

**Step 3: Visual polish**
- Wrap each screenshot in a `Card` with subtle border + shadow and `aspect-video` ratio so layout stays consistent even before image loads.
- Use `LazyImage` for the lower 5 (off-screen) and one regular eager `<img>` for the first (above-the-fold LCP).

**Technical notes**
- Demo routes require auth via `DemoAuthGuard` — I'll need to log into the demo first using the browser tool before screenshotting. Demo login is at `/demo/login`.
- Screenshots will be saved at ~1600x900 (or similar 16:9) and compressed for web.
- Files written to `public/demo-screenshots/` so they're served as static assets.

**Files to change**
- `src/pages/Features.tsx` (update features array + replace placeholder block)
- New: `public/demo-screenshots/dashboard.png`, `attorneys.png`, `matching.png`, `payments.png`, `reports.png`, `audit.png`
