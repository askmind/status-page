# Status Page

A simple self-hosted daily dashboard designed for a spare laptop connected to a monitor. The MVP shows a large clock, Entur transport departures, a Yr meteogram, Google Calendar events, and a daily cat.

## Features

- Fullscreen responsive dashboard layout
- Large date and time display
- Separate widgets for transport, weather, and calendar
- Google Calendar events for today and the next 2 days
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

## Google Calendar Setup

Google Calendar access is configured once with OAuth, then the dashboard uses a refresh token from your local environment. The client secret and refresh token stay server-side.

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable the Google Calendar API for the project.
4. Configure the OAuth consent screen for a personal external app and add your own Google account as a test user if needed.
5. Create OAuth client credentials:
   - Application type: Web application
   - Authorized redirect URI: `http://localhost:3000/api/google/callback`
6. Add the credentials to `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
GOOGLE_CALENDAR_IDS=all
```

7. Start or restart the dev server:

```bash
npm run dev
```

8. Visit [http://localhost:3000/api/google/auth](http://localhost:3000/api/google/auth).
9. Approve read-only calendar access.
10. Copy the displayed refresh token into `.env.local`:

```env
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

11. Restart the dev server again so Next.js picks up the new env value.

### Calendar Selection

Show all visible calendars from your Google Calendar list:

```env
GOOGLE_CALENDAR_IDS=all
```

Or show only specific calendars:

```env
GOOGLE_CALENDAR_IDS=primary,some_other_calendar_id
```

`primary` only means your main Google Calendar. For older local configs, `GOOGLE_CALENDAR_ID=primary` is still supported as a legacy fallback when `GOOGLE_CALENDAR_IDS` is not set.

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
      calendar/route.ts
      google/auth/route.ts
      google/callback/route.ts
      transport/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    CalendarWidget.tsx
    CatWidget.tsx
    ClockWidget.tsx
    DashboardCard.tsx
    TransportWidget.tsx
    WeatherWidget.tsx
  lib/
    googleCalendar.ts
    types.ts
```

Transport and calendar use local API routes. Weather displays the Yr meteogram SVG directly and refreshes it automatically. The cat widget calls Cataas directly from the browser.
