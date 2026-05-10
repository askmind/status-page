# Status Page

A simple self-hosted daily dashboard designed for a spare laptop connected to a monitor. The MVP shows a large clock, Entur transport departures, a Yr meteogram, a live news feed, and a daily cat.

## Features

- Fullscreen responsive dashboard layout
- Large date and time display
- Separate widgets for transport, weather, and news
- Live headlines from Norwegian and major global outlets
- Yr meteogram weather forecast
- Entur public transport departures
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

Optionally create a Docker environment file. Docker Compose reads `.env` for the variables listed in `docker-compose.yml`:

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
      news/route.ts
      transport/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    NewsFeedWidget.tsx
    CatWidget.tsx
    ClockWidget.tsx
    DashboardCard.tsx
    TransportWidget.tsx
    WeatherWidget.tsx
  lib/
    news.ts
    newsSources.ts
    types.ts
```

Transport and news use local API routes. Weather displays the Yr meteogram SVG directly and refreshes it automatically. The cat widget calls Cataas directly from the browser.
