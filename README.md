# Status Page

A simple self-hosted daily dashboard designed for a spare laptop connected to a monitor. The MVP shows a large clock, Entur transport departures, a Yr meteogram, a live news feed, a workout leaderboard, and a daily cat.

## Features

- Fullscreen responsive dashboard layout
- Large date and time display
- Separate widgets for transport, weather, and news
- Live headlines from Norwegian and major global outlets
- Yr meteogram weather forecast
- Entur public transport departures
- Friends workout leaderboard for weekly running distance, strength workouts, and weekly streaks
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

## Workout Leaderboard

The workout leaderboard is backed by `/api/workouts/leaderboard`, so Strava and Hevy tokens stay on the server. The frontend only receives weekly totals and connection status.

For local UI work, leave this enabled:

```bash
WORKOUT_LEADERBOARD_USE_MOCK=true
```

To use live data, set it to `false` and provide the token environment variables referenced in `src/lib/workoutFriends.ts`:

```bash
WORKOUT_LEADERBOARD_USE_MOCK=false
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...

STRAVA_REFRESH_TOKEN_ANDRE=...
HEVY_API_TOKEN_ANDRE=...

STRAVA_REFRESH_TOKEN_FRIEND_1=...
HEVY_API_TOKEN_FRIEND_1=...

STRAVA_REFRESH_TOKEN_FRIEND_2=...
HEVY_API_TOKEN_FRIEND_2=...
```

Strava uses refresh-token based OAuth. The server exchanges each configured `STRAVA_REFRESH_TOKEN_*` for a short-lived access token before calling Strava activities, so Strava secrets are never sent to the browser.

Add friends by editing `src/lib/workoutFriends.ts` and adding a unique `id`, display `name`, and the environment variable names that hold their Strava refresh token and Hevy token.

Restart `npm run dev` after changing `.env.local`; Next.js does not reliably reload server environment variables in an already-running dev process.

In development, `/api/workouts/strava-debug` checks Andre's Strava setup without returning tokens or secrets. Use it to confirm token refresh, athlete access, activity fetch status, activity summaries, and calculated running kilometers.

Leaderboard ordering is not points-based. It sorts by strength workouts this week, then kilometers run this week, then weekly streak, then name.

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
      workouts/strava-debug/route.ts
      workouts/leaderboard/route.ts
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
    WorkoutLeaderboardCard.tsx
  lib/
    news.ts
    newsSources.ts
    strava.ts
    types.ts
    workoutFriends.ts
    workoutLeaderboard.ts
```

Transport, news, and workout leaderboard data use local API routes. Weather displays the Yr meteogram SVG directly and refreshes it automatically. The cat widget calls Cataas directly from the browser.
