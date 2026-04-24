# Status Page

A simple self-hosted daily dashboard designed for a spare laptop connected to a monitor. The MVP shows a large clock, mock public transport departures, mock weather, and a mock calendar agenda.

## Features

- Fullscreen responsive dashboard layout
- Large date and time display
- Separate widgets for transport, weather, and calendar
- API routes ready for future real integrations
- Docker and Docker Compose deployment

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm run build
```

There are no tests yet, so `npm test` is not configured.

## Run With Docker

Optionally create a local environment file:

```bash
cp .env.example .env
```

Build and start the dashboard:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
src/
  app/
    api/
      calendar/route.ts
      transport/route.ts
      weather/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    CalendarWidget.tsx
    ClockWidget.tsx
    DashboardCard.tsx
    TransportWidget.tsx
    WeatherWidget.tsx
  lib/
    types.ts
```

Each widget is a small client component that fetches from its matching API route and refreshes automatically. The API routes currently return mock data and can be replaced with real integrations later.
