# Stock Watch

Full-stack stock alert application for the Designli React Native + Node assessment.

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

Copy `apps/mobile/.env.example` to `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

Use:
- `http://10.0.2.2:4000` for Android emulator
- your machine IP, for example `http://192.168.1.20:4000`, for a physical Android device

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

## Docker

Run the backend stack with Docker:

```bash
docker compose up --build
```

Before starting the API container, make sure `FINNHUB_API_KEY` is exported in your shell or provided through a `.env` file that Docker Compose can read.

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

## Assessment Delivery Checklist

- Keep the repository public before submission
- Record a short demo video showing login, stocks, chart, alert creation, and notification behavior
- Build the Android app and upload the artifact for review
- Include your final environment/setup notes if you change any defaults
