# Stock Watch

Full-stack stock alert application for the Designli React Native + Node assessment.

## Live deployment (reviewers)

The backend API is deployed and running at:

**https://stock-watch-monorepo.onrender.com**

| Check | URL |
|-------|-----|
| API root | https://stock-watch-monorepo.onrender.com/ |
| Health | https://stock-watch-monorepo.onrender.com/health |

The **Android APK** submitted for review is built with this API URL baked in (`EXPO_PUBLIC_API_URL`). You only need to:

1. Install the APK on a physical Android device (or emulator with Google Play).
2. Allow notifications when prompted (for price-alert push).
3. Log in with the demo account below.

No local backend, Docker, or Wi‑Fi configuration is required for testing—the app talks to the hosted server over the internet.

**Demo login** (seeded on the deployed database):

```text
email: demo@stockwatch.dev
password: Password123
```

> **Note:** Render’s free tier may sleep after inactivity. The first request after idle can take ~30 seconds.

The project includes:
- an Expo React Native app in `apps/mobile`
- a Node.js + Express API in `apps/api`
- PostgreSQL via Prisma
- Finnhub market data integration
- Firebase Cloud Messaging support for price alerts

## Features

- Email/password registration and login
- Real-time-ish stock list with periodic refresh
- Stock detail chart powered by Finnhub candles
- Create and list price alerts
- Background backend worker that checks active alerts and marks them as triggered
- Device token registration from the mobile app for push notifications
- Dockerized backend + Postgres setup for deployment/demo

## Tech Stack

- Mobile: Expo, React Native, React Navigation, `expo-notifications`
- Backend: Node.js, Express, Prisma, PostgreSQL, Firebase Admin
- Market data: Finnhub REST API

## Project Structure

```text
.
|-- apps
|   |-- api
|   |   |-- prisma
|   |   `-- src
|   `-- mobile
|       `-- src
|-- docker-compose.yml
`-- README.md
```

## Environment Setup

### API

Copy `apps/api/.env.example` to `apps/api/.env` and fill in the values:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stock_watch
JWT_SECRET=super-secret-development-key
JWT_EXPIRES_IN=7d
FINNHUB_API_KEY=your_finnhub_api_key
FINNHUB_BASE_URL=https://finnhub.io/api/v1
ALERT_POLL_INTERVAL_MS=60000
WEB_ORIGIN=*
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Mobile

Copy `apps/mobile/.env.example` to `apps/mobile/.env`.

**Production / submitted Android build** (points at hosted API):

```env
EXPO_PUBLIC_API_URL=https://stock-watch-monorepo.onrender.com
```

**Local development** (API running on your machine):

```env
# Android emulator → host machine
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000

# Physical device on same Wi‑Fi as your PC (replace with your LAN IP)
# EXPO_PUBLIC_API_URL=http://192.168.1.20:4000
```

Rebuild the Android app after changing `EXPO_PUBLIC_API_URL`—the value is embedded at build time.

## Running Locally

Install dependencies from the repo root:

```bash
npm install
```

Start PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

Generate Prisma client, run migrations, and seed the demo user:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Start the API:

```bash
npm run dev:api
```

Start the Expo app:

```bash
npm run dev:mobile
```

Demo login after seeding:

```text
email: demo@stockwatch.dev
password: Password123
```

## Docker (extra credit — local backend)

For reviewers who want to run the backend locally instead of using Render:

```bash
docker compose up --build
```

Before starting the API container, make sure `FINNHUB_API_KEY` is exported in your shell or provided through a `.env` file that Docker Compose can read.

The hosted API at https://stock-watch-monorepo.onrender.com uses the same Docker image and configuration deployed on [Render](https://render.com).

## Push Notifications

The app registers a native device push token after login and sends it to the API.

To receive notifications on Android:
- create a Firebase project
- enable Firebase Cloud Messaging
- provide Firebase Admin credentials to the API through the environment variables above
- build the Expo app as an Android app or dev build on a real device

Notes:
- `expo-notifications` can request the native Android device token, but this requires a real device build rather than Expo Go.
- If Firebase credentials are omitted, alert creation and triggering still work, but notification delivery is skipped.

## API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /stocks`
- `GET /stocks/:symbol`
- `GET /alerts`
- `POST /alerts`
- `POST /devices/token`
- `GET /health`

## Verification

Completed verification in this repo:
- `npm run prisma:generate --workspace api`
- `npm run lint --workspace api`
- `npm run typecheck --workspace mobile`

## Code Explanation (for reviewers)

A detailed technical walkthrough of the architecture, modules, and data flows is available in **[CODE_EXPLANATION.md](./CODE_EXPLANATION.md)**.

## Assessment Delivery Checklist

- Keep the repository public before submission
- **API:** https://stock-watch-monorepo.onrender.com (Docker-based deploy on Render)
- **Android APK:** built with `EXPO_PUBLIC_API_URL=https://stock-watch-monorepo.onrender.com` (install on device only—no local API setup needed)
- Record a short demo video showing login, stocks, chart, alert creation, and notification behavior
- Upload the APK to WeTransfer and share the link with the repository URL
- Technical documentation: [CODE_EXPLANATION.md](./CODE_EXPLANATION.md)
