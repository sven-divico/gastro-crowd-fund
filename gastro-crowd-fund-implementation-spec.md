# clarifications
Auth token: static token from .env is fine.
Storage: stick with localStorage as specified
Timezones: UTC with frontend-localized display
Quota edge cases: Should POST /events/{id}/book clamp and return 200 with clamped value
Status derivation: Should status be computed server-side from rules on each fetch
Menus: keep /assets/menus/{eventId} separate
Frontend runtime config: small runtime config JSON served by backend 
Admin/Debug: Gate /admin with same token
NPM domains: Final hostnames to bake into CORS and ENV. use frontend.demo.divico-gmbh.de and api.demo.divico-gmbh.de.
Media handling: Serve assets/media/* via backend static mount with cache headers No video autoplay/muted/loop defaults to enforce
Seed data: 7 event IDs (1001, 1002, 1003, ...) and some initial booked_seats for each demos, plus initial cutoff_at relative to now.
Reset endpoint: Add /admin/reset to restore seed state between demos
Accessibility: language/locale is de-AT, currency is € e.g. "1.123,50 €"?

CORS: Single allowed origin from .env with fallback to http://localhost:8080 in dev.
Static assets: Served by backend at /static/* from mounted /data/assets.

Menus: Keep separate endpoint; frontend fetches from /assets/menus/{eventId}. GET /events/{id} will include a menu_url pointer, not inline menus.

Media autoplay: Default to autoplay; provide a flag so we can toggle to autoplay/muted/loop per asset if desired.

Locale/currency: Use de-AT with Intl.NumberFormat for euros (e.g., “1.123,50 €”)


# 1) Architecture Overview

Goal: Mobile-first, multi-page demonstrator that showcases the guest journey and quota-to-confirmation mechanics. Single shared demo password; no PII; no payments. Easily tweakable via SQLite and mounted files. Deployable with one Docker Compose stack incl. reverse proxy + TLS.

Stack:

Frontend: React (TypeScript) + Tailwind CSS (+ DaisyUI for fast theming/components; Chakra UI optional for special widgets).

Backend: FastAPI (Python) + SQLModel (ORM on SQLAlchemy) + SQLite (file DB).

Infra: Docker Compose; Nginx Proxy Manager (jc21/nginx-proxy-manager) for SSL and vhost routing.

Config: Single .env for all services. One demo password (no user store). Shared bind-mount for editable demo assets (e.g., menus, images).

# 2) Frontend Specification (TypeScript)
2.1 Navigation & Layout

Responsive, mobile-first layout (Tailwind).

Top App Bar with product wordmark and burger menu (DaisyUI navbar + drawer).

Routes (React Router):

/login

/ (Campaigns / Events list) — optional redirect to the single active event during demos

/event/:eventId (Event details + booking interaction)

/about (one-pager concept, optional)

/admin (hidden/dev: read-only debug of DB values; optionally gated by same password)

2.2 Pages (as per customer journey)
Login (/login)

Form: Password input + submit.

On success: store short-lived “demo token” (localStorage) and route to /.

On failure: friendly error toast.

Events List / Dashboard (/)

Cards per event: banner, title, short copy, progress bar (DaisyUI progress), seats booked vs quota and optional radial progress.

Filters: date range “next 7 days”.

CTA: “View event” → /event/:id.

Event Detail (/event/:id)

Hero section: banner (image/video placeholder), title, date/time, venue.

Quota section:

Seats: booked / quota + progress bar (with animated number change).

Optional “X seats needed by T-48h to unlock” chip.

Booking widget: “Book N seats” (N default 2); Select menu (menu A/B/C read from mounted JSON).

Immediate visual feedback: After POST book → update progress in place; confetti/celebration micro-animation at thresholds (80%, 100%).

Confirmation mock: If event reaches quota and now ≥ T-48h cutoff → show modal “Event confirmed 🎉” (no integrations).

Perk visualization: Badge (“Free dessert / loyalty points”) toggled by DB flag.

About (/about) 

Static explainer of the concept; links to contact.

Admin / Debug (/admin) (optional)

Read-only view of current SQLite values to support live demos; no write UI (writes happen via DB or API tools).

2.3 UI Frameworks & Patterns

Tailwind CSS for utility-first styling; DaisyUI for ready-made components (navbar, drawer, card, progress, modal, toast).

Chakra UI is optional, for special UI (e.g., accessible sliders, number inputs) — use sparingly to avoid style collisions.

Icons: Heroicons or Lucide (MIT) for clarity (menu, calendar, seat, check, info).

2.4 State & Data Access

Auth context stores demo token; Axios/Fetch attaches it as Authorization: Bearer <token>.

SWR/React Query (optional) for data fetching + cache + optimistic updates (nice for “instant quota progress”).

# 3) Backend Specification (FastAPI + SQLModel + SQLite)
3.1 Data Model (SQLModel)

Event (opening night):

id (int, PK)

name (str)

description (str)

start_at (datetime)

cutoff_at (datetime) — confirmation deadline (e.g., T-48h)

total_seats (int)

booked_seats (int)

menus (json) — references to mounted JSON (e.g., menus/<eventId>.json)

perks (json) — e.g., { "free_dessert": true, "loyalty_points": 200 }

status (enum): PLANNED | CONFIRMED | CANCELLED (computed or set for demo)

hero_media (json) — placeholders for image/video filenames from mounted volume

location (str) — simple string (address)

Booking (optional for traceability; can be skipped for demo):

id (int, PK)

event_id (FK → Event.id)

quantity (int) — seats

menu_selection (json) — e.g., { "starter": "A", "main": "B" }

created_at (datetime)

(For the demo, it’s acceptable to only mutate booked_seats on Event and skip Booking records.)

3.2 API Endpoints (all JSON; bearer token required except /auth)

POST /auth
Body: { "password": "…" }
200: { "token": "<opaque_or_env_defined>" }
Notes: Compare against DEMO_PASSWORD from .env. Token can be a static env value or random on boot.

GET /events?from=<date>&to=<date>
Returns list filtered to “next 7 days”. Includes computed fields: progressPct, seatsRemaining, almostThere (≥80% and before cutoff).

GET /events/{id}
Returns full event with menus/perks and media placeholders.

POST /events/{id}/book
Body: { "quantity": 2, "menu": { ... } } (menu optional in demo)
Effect: Increment booked_seats (bounded by total_seats).
Return: Updated event snapshot.

POST /events/{id}/status/confirm (demo helper, optional)
Force status=CONFIRMED to trigger UI modal.

POST /events/{id}/status/cancel (demo helper, optional)

PUT /events/{id} (demo helper)
Partial updates (e.g., tweak booked_seats, perks). Use conservatively; basic auth token required.

GET /assets/menus/{eventId}
Reads mounted JSON menu file to feed the frontend (or serve via /events/{id}).

Auth middleware:

FastAPI dependency verifies Authorization header equals known token (from /auth).

No users/roles/jwks; single demo user only.

3.3 Behaviors & Business Rules (Demo)

Almost-there nudge: When booked_seats / total_seats >= 0.8 and now < cutoff_at, surface a UI banner.

Confirmation: When booked_seats >= total_seats or manually confirmed or time passes cutoff_at with met quota → set status=CONFIRMED (demo: also expose modal trigger endpoint).

Cancellation (not met): If < cutoff_at and quota not met, set status=CANCELLED; UI shows soft “switch night” banner (no cross-event logic required in demo).

3.4 Seed & Mutability

Seed data: One or two Events seeded at startup (via SQLModel create_all() + seed script).

Mutation: Bookings adjust counts. Operators can manually edit the SQLite DB or call PUT /events/{id} for live scenario changes.

# 4) Configuration & Secrets
4.1 .env (shared)

DEMO_PASSWORD=eat_good#

API_PORT=8000

FRONTEND_PORT=443 / 80  #(or 8080 if serving static)

PUBLIC_BASE_URL=https://demo.divico-gmbh.de (for asset links)

ASSETS_DIR=/data/assets (mounted path)

DB_PATH=/data/db/app.db

JWT_OR_TOKEN=<opaque-token-or-random> (if you prefer static token)

(Exact port values can be finalized during compose wiring.)

# 5) Docker Compose Topology

Services (single docker-compose.yml):

nginx-proxy-manager (jc21/nginx-proxy-manager)

Ports: 80:80, 443:443, 81:81 (admin UI)

Volumes: ./data/npm/data:/data, ./data/npm/letsencrypt:/etc/letsencrypt

Purpose: Simple SSL + vhost config for non-tech stakeholders.

Set up proxy hosts:

frontend.demo.your-domain → Frontend container (HTTP) + Force SSL + HTTP/2

api.demo.your-domain → Backend container (HTTP) + CORS allowed from frontend origin

backend (FastAPI + Uvicorn)

Env: from .env

Ports: expose internal (e.g., 8000) only to NPM network

Volumes:

./shared:/data (bind mount; contains db/app.db, assets/menus, assets/media)

Depends on: none

Healthcheck: /health (simple ping endpoint)

frontend (React app)

Option A (recommended): build static & serve with a lightweight web server (or via the backend’s static mount).

Ports: internal (e.g., 8080) only to NPM network

Env: API base URL (https://api.demo.divico-gmbh.de) injected at build or runtime (see below).

Volumes: read-only static site; no persistence needed.

## Networks:

proxy (external or compose-defined) — attach NPM + frontend + backend.

Avoid exposing backend directly to host; route via NPM.

## Volumes / Mounts:

./shared/ → /data/ on backend (read/write)

/data/db/app.db — SQLite file (easy manual edits)

/data/assets/menus/*.json — human-editable menu definitions

/data/assets/media/ — images/videos for banners (see placeholders below)

# 6) Security (Demo-appropriate)

Single password login via /login → /auth; no user accounts; no registration.

Bearer token (opaque) for subsequent API calls.

CORS: Allow only https://frontend.demo.divico-gmbh.de.

TLS: Terminated at Nginx Proxy Manager.

No PII / payments in demo.

Rate limiting / brute force not required for demo; optional to add minimal lockout after 5 bad attempts.

# 7) Observability & Ops (Lightweight)

Backend logs: stdout (structured JSON optional).

Request IDs: simple middleware adds X-Request-Id for tracing in logs.

Health endpoint: /health for compose healthcheck.

DB backups: copy /data/db/app.db as needed.

Reset script: optional tiny admin endpoint to reset booked_seats to seed values between demos.

# 8) Performance & Accessibility (Demo targets)

Performance: Preload hero media; lazy-load below-the-fold images. Keep bundles small; tree-shake Chakra if used.

Accessibility: Keyboard focus states, ARIA labels on burger, color-contrast for progress bars, readable font sizes (mobile).

# 9) Acceptance Criteria (Demo)

Login gate with single password; wrong pw shows error; right pw routes to /.

List page shows at least one event with progress bar and seats booked/quota.

Detail page shows date/time, menu options (from JSON), perks, and a Book action.

Booking increments the quota immediately; UI updates without full reload.

When quota met or via manual confirm, a confirmation modal appears.

NPM provides a public HTTPS URL for both frontend & API; certificate is valid.

Demo operator can edit SQLite or menus JSON on disk and refresh UI to reflect changes.

10) Content Placeholders (Images / Videos)

Yes — include placeholders so stakeholders feel the “real” experience. Please drop assets into the mounted folder; we’ll reference them by filename only.

Folder structure (on host):

shared/
  db/app.db
  assets/
    media/
      hero-velden-01.jpg        (landing / list card)
      hero-event-italian.mp4    (optional short loop for event banner)
      logo-gastrocrowd.svg
    menus/
      event-1001.json           (menu set A/B/C for event 1001)
      event-1002.json


Placeholders to create now (filenames to reserve):

assets/media/hero-velden-01.jpg — atmospheric Velden night street / restaurant exterior.

assets/media/hero-event-italian.mp4 — 5–8s loop of plating/pouring (muted, autoplay inline).

assets/media/logo-gastrocrowd.svg — simple wordmark.

assets/menus/event-1001.json — structure: { "menus":[{ "id":"A", "name":"Alpe-Adria", "price":45, "courses":[...] }, ...] }

(You provide actual imagery/MVPv4; we’ll wire references in seed.)

11) Environment Matrix (Dev / Demo)
Setting	Dev (local)	Demo (public)
Frontend URL	http://localhost:8080
	https://frontend.demo.divico-gmbh.de

API URL	http://localhost:8000
	https://api.demo.divico-gmbh.de

TLS	Not required	Required via NPM
Auth	Same single password	Same single password
Data	./shared/db/app.db (git-ignored)	Same (bind-mount on server)
Menus/Media	./shared/assets/...	Same
12) Risks / Constraints (Demo)

SQLite concurrency is fine at demo scale; avoid concurrent writes during presentations.

Chakra + DaisyUI mix can cause style drift — prefer DaisyUI by default; use Chakra only where necessary.

Public demo with a single password is not production-secure; keep content non-sensitive.