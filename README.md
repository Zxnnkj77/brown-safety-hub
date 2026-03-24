# Brown Safety Hub

A campus safety platform for Brown University. Students can submit incident reports and view public safety information. Admins moderate reports, publish verified incidents, issue alerts, and manage safe locations.

## Tech Stack

| Layer    | Stack                              |
| -------- | ---------------------------------- |
| Frontend | React, Vite, TypeScript, Leaflet   |
| Backend  | Express 5, TypeScript, Zod         |
| Database | Supabase (Postgres + Row Level Security) |

## Features

- **Report submission** -- students file anonymous incident reports
- **Report history** -- session-based history via `X-Session-ID` header
- **Public incidents** -- verified incidents viewable by anyone
- **Active alerts** -- admin-issued campus safety alerts
- **Safe locations map** -- interactive Leaflet map of safe places on campus
- **Admin moderation** -- review reports, publish incidents, manage alerts and locations (Supabase Auth protected)

## Project Structure

```
/
├── src/                  # React frontend
│   ├── components/       # Reusable UI components
│   ├── screens/          # Page-level views
│   ├── api.ts            # API client
│   └── App.tsx           # Root component + routing
├── server/               # Express backend
│   └── src/
│       ├── index.ts      # Server entry point
│       ├── routes/       # Route handlers (reports, incidents, alerts, admin, etc.)
│       ├── middleware/    # Auth middleware
│       ├── validation/   # Zod schemas
│       └── supabaseClient.ts
├── supabase/
│   └── schema.sql        # Database schema + RLS policies
├── vite.config.ts        # Vite config (dev proxy to backend)
└── index.html            # HTML entry point
```

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd brown-university-safety-hub

# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor in the Supabase dashboard.
3. Paste and run the contents of `supabase/schema.sql`.

### 3. Configure environment variables

**Backend** -- create `server/.env`:

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
PORT=3001
```

Find these values in your Supabase project under **Settings > API**.

**Frontend** -- create `.env.local` (project root):

```env
VITE_API_URL=
```

Leave `VITE_API_URL` empty for local development. The Vite dev server proxies `/api` requests to `localhost:3001` automatically. Set this to your production API URL when deploying.

## Running Locally

Start both servers in separate terminals:

```bash
# Terminal 1 -- backend (port 3001)
cd server
npm run dev

# Terminal 2 -- frontend (port 3000)
npm run dev
```

The frontend runs at `http://localhost:3000`.

## API Overview

### Public routes

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| POST   | `/api/reports`                | Submit a new report            |
| GET    | `/api/reports/my-history`     | Get reports for current session |
| GET    | `/api/incidents/public`       | List verified public incidents |
| GET    | `/api/alerts/public`          | List active alerts             |
| GET    | `/api/safe-locations`         | List safe locations            |
| GET    | `/api/health`                 | Health check                   |

### Admin routes (require Supabase Auth)

| Method | Endpoint                           | Description                  |
| ------ | ---------------------------------- | ---------------------------- |
| GET    | `/api/admin/reports`               | List all reports             |
| PATCH  | `/api/admin/reports/:id/status`    | Update report status         |
| POST   | `/api/admin/incidents`             | Create a public incident     |
| PATCH  | `/api/admin/incidents/:id`         | Update an incident           |
| POST   | `/api/admin/alerts`                | Create an alert              |
| POST   | `/api/admin/safe-locations`        | Add a safe location          |

## Environment Variables

| Variable                  | Location      | Description                                                  |
| ------------------------- | ------------- | ------------------------------------------------------------ |
| `SUPABASE_URL`            | `server/.env` | Your Supabase project URL                                    |
| `SUPABASE_SERVICE_ROLE_KEY` | `server/.env` | Service role key (full DB access, bypasses RLS)             |
| `PORT`                    | `server/.env` | Backend port (default: `3001`)                               |
| `VITE_API_URL`            | `.env.local`  | API base URL for frontend (leave empty for local dev proxy)  |

## Notes

- **Do not commit `.env` or `.env.local`** -- both are in `.gitignore`.
- **Keep `SUPABASE_SERVICE_ROLE_KEY` private.** This key bypasses Row Level Security and has full database access. It must only be used server-side.
- Example env files are provided: `server/.env.example` and `.env.local.example`.
