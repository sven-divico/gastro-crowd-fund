# Gastro Crowd Fund — Implementation Plan

Goal: Ship a polished, mobile‑first demo that prioritizes UI and visual experience while meeting the core journey and rules from the spec. This plan lists what’s done, what’s missing, and a step‑by‑step path to complete the demo.

## Current Status (vs Spec)
- Auth/token: Implemented. `/auth` with static token from `.env`; token stored in `localStorage`.
- Events API: Implemented basic list/detail, booking, confirm/cancel, update; computed fields returned (progressPct, seatsRemaining, almostThere, computed status).
- Menus endpoint: Implemented. Reads JSON from mounted assets dir.
- Admin reset: Implemented at `/admin/reset`.
- Static assets: Served by backend at `/static` from `ASSETS_DIR`.
- CORS: Single allowed origin via `.env` with dev fallback.
- Seed data: Implemented for 7 events with hero media placeholders and menu URLs.
- Frontend pages: Login, Events list, Event detail, About, Admin exist with basic flows.

Gaps / To Improve (highlighting UI/UX first):
- Layout & Navigation: No navbar/drawer, branding, or iconography; needs mobile‑first polish.
- Events List: Missing banner/thumb, date filter (next 7 days), status chip/“almost there” nudge, richer progress visualization.
- Event Detail: No hero media section (image/video + autoplay/muted/loop), no animated progress/number, no “X seats needed by T‑48h” chip, no confirmation modal on threshold, no confetti/celebration animation, minimal error/success toasts.
- Runtime Config: Backend serves `/config.json` but frontend doesn’t consume it; API base currently from Vite env. Assets base not centrally wired.
- Data Fetching: Lacks SWR/React Query for cache + optimistic updates.
- Accessibility: Needs keyboard focus states, aria labels, and contrast checks.
- API Filters: `GET /events` ignores `from`/`to` query (spec calls for “next 7 days” filter).
- Observability: No request‑id middleware or structured log fields.
- Static caching: No explicit cache headers for `/static` assets.
- Admin UI: Basic table only; no confirm/cancel controls; no reset feedback.

## Phase 1 — Visual Foundation (Highest Priority)
1) Global Layout & Theming
- Add DaisyUI Navbar with wordmark/logo, burger + drawer for mobile nav.
- Establish color theme, typography scale, spacing rhythm; ensure good contrast.
- Add Heroicons or Lucide for icons (menu, calendar, location, seat, info).

2) Events List UI
- Card redesign: banner thumbnail from `ev.hero_media.image` (fallback placeholder), title, datetime, venue.
- Progress section: animated progress bar and percentage; small status chip (PLANNED/CONFIRMED/CANCELLED).
- “Almost there” nudge (≥80% and before cutoff) as a subtle badge/chip.
- Date filter: default to “next 7 days”; persist filter state in querystring.

3) Event Detail UI
- Hero section: render image or video per `hero_media` with autoplay/muted/loop flags; responsive crop.
- Quota section: animated number for `booked/total`, progress bar, and “X seats needed by T‑48h” chip.
- Booking widget: improve inputs (stepper/number input), loading/disabled states; require menu selection when menus exist; show friendly validation messages.
- Micro‑interactions: toast on errors/success; confetti/celebration when crossing 80% and 100%.
- Confirmation modal: show when status transitions to CONFIRMED; allow close.

Deliverable: A visually polished, mobile‑first UI matching the spec’s journey.

## Phase 2 — Data & Runtime Config
4) Frontend Runtime Config
- On app bootstrap, fetch `/config.json` to derive `apiBase`, `assetsBase`, `allowedOrigin`.
- Initialize Axios baseURL and asset URL builders from runtime config; fallback to `/api` for dev.

5) Data Fetching & Optimistic Updates
- Integrate React Query (or SWR) for `/events`, `/events/{id}` and bookings.
- On booking, optimistic update progress; reconcile with server response/message.

6) API Improvements
- Implement `from`/`to` filters in `GET /events` (UTC, ISO 8601 parsing) and add a helper `?next=7d` shortcut.
- Add basic cache headers for `/static` responses (e.g., 1 day for images/videos) without breaking hot swaps during dev.

Deliverable: Smooth, responsive UX with live updates and environment‑agnostic config.

## Phase 3 — Admin & Observability
7) Admin Enhancements
- Display computed status and progress; add buttons for Confirm, Cancel, and Reset.
- Feedback toasts after admin actions; auto‑refresh list.

8) Observability & DX
- Add simple request‑id middleware (generate UUID, return `X-Request-Id`).
- Slightly structure logs for key events (auth, booking, admin actions) with request id.

9) Accessibility & Performance
- Keyboard navigation through all controls; aria‑labels on interactive elements.
- Lazy‑load below‑the‑fold images; preload hero media on detail view.
- Verify color contrast; adjust theme tokens as needed.

Deliverable: Smoother demos with better debugging and inclusive UX.

## Phase 4 — Polishing & Deployment
10) Visual Polish
- Add logo SVG and refine spacing/hover/focus states.
- Tune animations (durations/easings) for progress and confetti.

11) Docker / NPM wiring
- Confirm compose builds for frontend and backend; set `VITE_API_BASE_URL` for demo.
- Document NPM host configuration (frontend + API vhosts) and `.env` values for CORS.

12) Content & QA
- Ensure shared assets in `shared/assets/media` and `shared/assets/menus` exist and render well.
- UAT checklist against Acceptance Criteria.

Deliverable: Demo‑ready stack behind HTTPS with curated visuals and content.

## Detailed Task List
- Layout/Nav
  - Add Navbar + Drawer with links (Home, About, Admin, Logout) and logo.
  - Replace bare buttons/links with DaisyUI variants; consistent spacing.

- Events List
  - Render hero thumbnail using `/static/{image}` from `hero_media.image`.
  - Add date filter (default 7 days); connect to `GET /events` query.
  - Show status chip and “almost there” badge.
  - Animate progress; format dates with `de-AT` locale.

- Event Detail
  - Hero image/video component honoring `autoplay`, `muted`, `loop`.
  - Animated counters; “needed seats by cutoff” chip.
  - Menu selector required when present; disable/enable book button; toasts.
  - Confetti when crossing 80% and when reaching 100%; confirmation modal on status change.

- Runtime Config
  - `GET /config.json` on boot → set axios base + asset helpers.
  - Fallback to `/api` in dev; leverage Vite proxy.

- React Query/SWR
  - Add hooks (`useEvents`, `useEvent`, `useBookEvent`) with optimistic updates.

- Backend Enhancements
  - Implement date filtering for `/events` (from/to query params in UTC).
  - Add cache headers to static responses (lightweight config via Starlette middleware or custom StaticFiles).
  - Add request‑id middleware.

- Admin UI
  - Buttons for confirm/cancel/reset; success/error toasts; auto‑refresh.

- A11y/Perf
  - Keyboard focus rings, aria labels, roles.
  - Lazy image loading; media preloads; audit bundle size.

## Acceptance Criteria (UI‑first)
- Mobile‑first layout with branded navbar/drawer; consistent theme.
- Events list shows banner, status, animated progress, and 7‑day filter.
- Event detail shows hero media, animated progress, seat chip, menu selection, and toasts.
- Booking updates progress instantly; confetti/celebration at 80%/100%; confirmation modal appears when confirmed.
- Frontend reads `/config.json` and works in dev/prod without code changes.
- Admin can confirm/cancel/reset with clear feedback.
- Static assets load efficiently with sensible caching; app accessible via keyboard.

## Sequencing & Effort Notes
- Prioritize Phase 1 UI changes first; they deliver the most visible value.
- Phase 2 improves perceived speed and environment robustness.
- Phase 3/4 round out admin/ops and polish for demos.

If you want, I can start with Phase 1 by scaffolding the Navbar/Drawer and the Events List redesign, then wire the hero media component on the detail page.

