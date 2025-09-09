GastroCrowd Demo

Quick start

- Copy `.env.example` to `.env` and adjust as needed.
- Place media and menus under `shared/assets/media` and `shared/assets/menus`.
- Menus filenames: `event-<id>.json` (e.g., `event-1001.json`).

Local dev

- Backend: `uvicorn app.main:app --reload --port 8000` from `backend`
- Frontend: `npm i && npm run dev` from `frontend` (Vite on 8080)

Backend (FastAPI)

- Endpoints:
  - POST `/auth` → `{ token }` on correct password
  - GET `/events` → list with computed fields
  - GET `/events/{id}` → event details with `menus.menu_url`
  - POST `/events/{id}/book` → increments seats (clamped)
  - POST `/events/{id}/status/confirm|cancel`
  - POST `/admin/reset` → reset to seed
  - GET `/assets/menus/{eventId}` → reads `shared/assets/menus/event-<id>.json`
  - Static: `/static/*` → serves `shared/assets/*`

Frontend (Vite + React + Tailwind + DaisyUI)

- Pages: `/login`, `/`, `/event/:id`, `/about`, `/admin`
- Uses localStorage `demo_token` for auth
- Currency/locale: `de-AT`, Euros via `Intl.NumberFormat`

Docker Compose

- `nginx-proxy-manager`, `backend`, `frontend`
- Mounts `./shared` to backend at `/data`

