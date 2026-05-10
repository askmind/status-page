import { NextResponse } from "next/server";
import { WORKOUT_FRIENDS } from "@/lib/workoutFriends";
import {
  STRAVA_ACTIVITIES_URL,
  STRAVA_ATHLETE_URL,
  getStravaAccessToken,
  isRunningActivity,
  readSafeResponseBody,
  type StravaActivity,
} from "@/lib/strava";

export const dynamic = "force-dynamic";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const daysSinceMonday = (day + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

function toEpochSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function safeJsonParse<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

async function fetchStravaJson(url: URL | string, accessToken: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  const body = await readSafeResponseBody(response);

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const andre = WORKOUT_FRIENDS.find((friend) => friend.id === "andre");
  const refreshTokenEnvName = andre?.stravaRefreshTokenEnv ?? "STRAVA_REFRESH_TOKEN_ANDRE";
  const refreshToken = process.env[refreshTokenEnvName]?.trim();
  const weekStart = startOfWeek(new Date());
  const weekEnd = addDays(weekStart, 7);

  const env = {
    STRAVA_CLIENT_ID: Boolean(process.env.STRAVA_CLIENT_ID?.trim()),
    STRAVA_CLIENT_SECRET: Boolean(process.env.STRAVA_CLIENT_SECRET?.trim()),
    [refreshTokenEnvName]: Boolean(refreshToken),
  };

  if (!andre) {
    return NextResponse.json(
      {
        success: false,
        env,
        message: "Could not find Andre in workout friend config.",
      },
      { status: 500 },
    );
  }

  if (!refreshToken) {
    return NextResponse.json({
      success: false,
      env,
      message: `Missing ${refreshTokenEnvName}.`,
    });
  }

  try {
    const accessToken = await getStravaAccessToken(refreshToken, {
      friendName: andre.name,
      refreshTokenEnvName,
    });

    const athleteResponse = await fetchStravaJson(STRAVA_ATHLETE_URL, accessToken);
    const activitiesUrl = new URL(STRAVA_ACTIVITIES_URL);
    activitiesUrl.searchParams.set("after", String(toEpochSeconds(weekStart)));
    activitiesUrl.searchParams.set("before", String(toEpochSeconds(weekEnd)));
    activitiesUrl.searchParams.set("page", "1");
    activitiesUrl.searchParams.set("per_page", "200");

    const activitiesResponse = await fetchStravaJson(activitiesUrl, accessToken);
    const activities = activitiesResponse.ok
      ? safeJsonParse<StravaActivity[]>(activitiesResponse.body) ?? []
      : [];
    const activitySummaries = activities.map((activity) => ({
      name: activity.name,
      type: activity.type,
      sport_type: activity.sport_type,
      distance: activity.distance,
      start_date: activity.start_date,
      start_date_local: activity.start_date_local,
      countedAsRunning: isRunningActivity(activity),
    }));
    const totalRunningKm = Math.round(
      (activities
        .filter(isRunningActivity)
        .reduce((total, activity) => total + (activity.distance ?? 0), 0) /
        1000) *
        100,
    ) / 100;

    return NextResponse.json({
      success: athleteResponse.ok && activitiesResponse.ok,
      env,
      weekStartsAt: weekStart.toISOString(),
      weekEndsAt: weekEnd.toISOString(),
      tokenRefresh: {
        success: true,
      },
      athlete: {
        status: athleteResponse.status,
        ok: athleteResponse.ok,
        errorBody: athleteResponse.ok ? undefined : athleteResponse.body,
      },
      activities: {
        status: activitiesResponse.status,
        ok: activitiesResponse.ok,
        errorBody: activitiesResponse.ok ? undefined : activitiesResponse.body,
        count: activities.length,
        summaries: activitySummaries,
        totalRunningKm,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      env,
      weekStartsAt: weekStart.toISOString(),
      weekEndsAt: weekEnd.toISOString(),
      error: error instanceof Error ? error.message : "Unknown Strava debug error.",
    });
  }
}
