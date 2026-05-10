import { WORKOUT_FRIENDS, type WorkoutFriend } from "@/lib/workoutFriends";
import {
  STRAVA_ACTIVITIES_URL,
  getStravaAccessToken,
  isRunningActivity,
  readSafeResponseBody,
  type StravaActivity,
} from "@/lib/strava";
import type { WorkoutLeaderboardEntry, WorkoutLeaderboardResponse } from "@/lib/types";

const HEVY_WORKOUTS_URL = "https://api.hevyapp.com/v1/workouts";
const LOOKBACK_WEEKS = 52;
const METERS_PER_KM = 1000;

type WorkoutEvent = {
  date: Date;
  runningDistanceMeters: number;
  strengthWorkoutCount: number;
};

type HevyWorkout = {
  id?: string;
  title?: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
};

type FriendMetrics = {
  events: WorkoutEvent[];
  warnings: string[];
};

const MOCK_RESPONSE: WorkoutLeaderboardResponse = {
  updatedAt: new Date().toISOString(),
  weekStartsAt: startOfWeek(new Date()).toISOString(),
  weekEndsAt: addDays(startOfWeek(new Date()), 7).toISOString(),
  source: "mock",
  warnings: ["Using mock workout data. Set WORKOUT_LEADERBOARD_USE_MOCK=false and configure friend tokens to use live APIs."],
  leaderboard: sortLeaderboard([
    {
      id: "andre",
      name: "Andre",
      runningKmThisWeek: 18.6,
      strengthWorkoutsThisWeek: 3,
      weeklyStreak: 6,
      hasStravaConnection: false,
      hasHevyConnection: false,
      warnings: [],
    },
    {
      id: "friend_1",
      name: "Friend 1",
      runningKmThisWeek: 24.2,
      strengthWorkoutsThisWeek: 2,
      weeklyStreak: 4,
      hasStravaConnection: false,
      hasHevyConnection: false,
      warnings: [],
    },
    {
      id: "friend_2",
      name: "Friend 2",
      runningKmThisWeek: 9.4,
      strengthWorkoutsThisWeek: 2,
      weeklyStreak: 9,
      hasStravaConnection: false,
      hasHevyConnection: false,
      warnings: [],
    },
  ]),
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addWeeks(date: Date, weeks: number) {
  return addDays(date, weeks * 7);
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

function isDateInRange(date: Date, start: Date, end: Date) {
  return date >= start && date < end;
}

function getWorkoutDate(workout: HevyWorkout) {
  const raw = workout.end_time ?? workout.start_time ?? workout.created_at ?? workout.updated_at;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractHevyWorkouts(payload: unknown): HevyWorkout[] {
  if (Array.isArray(payload)) return payload as HevyWorkout[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.workouts)) return record.workouts as HevyWorkout[];
  if (Array.isArray(record.data)) return record.data as HevyWorkout[];
  return [];
}

function sortLeaderboard(entries: WorkoutLeaderboardEntry[]) {
  return [...entries].sort((a, b) => {
    if (b.strengthWorkoutsThisWeek !== a.strengthWorkoutsThisWeek) {
      return b.strengthWorkoutsThisWeek - a.strengthWorkoutsThisWeek;
    }
    if (b.runningKmThisWeek !== a.runningKmThisWeek) {
      return b.runningKmThisWeek - a.runningKmThisWeek;
    }
    if (b.weeklyStreak !== a.weeklyStreak) {
      return b.weeklyStreak - a.weeklyStreak;
    }
    return a.name.localeCompare(b.name);
  });
}

function logStravaActivityDebug(friendName: string, activities: StravaActivity[]) {
  if (process.env.NODE_ENV !== "development") return;

  console.log(`[Strava] ${friendName}: ${activities.length} activities returned.`);
  for (const activity of activities) {
    console.log("[Strava] activity", {
      friendName,
      name: activity.name,
      type: activity.type,
      sport_type: activity.sport_type,
      distance: activity.distance,
      start_date: activity.start_date,
      start_date_local: activity.start_date_local,
      countedAsRunning: isRunningActivity(activity),
    });
  }
}

async function fetchStravaEvents(
  friendName: string,
  refreshToken: string,
  refreshTokenEnvName: string,
  after: Date,
  before: Date,
): Promise<WorkoutEvent[]> {
  const accessToken = await getStravaAccessToken(refreshToken, {
    friendName,
    refreshTokenEnvName,
  });
  const url = new URL(STRAVA_ACTIVITIES_URL);
  url.searchParams.set("after", String(toEpochSeconds(after)));
  url.searchParams.set("before", String(toEpochSeconds(before)));
  url.searchParams.set("page", "1");
  url.searchParams.set("per_page", "200");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (process.env.NODE_ENV === "development") {
    console.log(`[Strava] ${friendName}: activities endpoint status ${response.status}.`);
  }

  if (!response.ok) {
    const body = await readSafeResponseBody(response);
    throw new Error(
      body
        ? `Strava activities request failed with status ${response.status}. Response body: ${body}`
        : `Strava activities request failed with status ${response.status}.`,
    );
  }

  const activities = (await response.json()) as StravaActivity[];
  logStravaActivityDebug(friendName, activities);

  return activities
    .filter(isRunningActivity)
    .map((activity) => {
      const rawDate = activity.start_date ?? activity.start_date_local;
      const date = rawDate ? new Date(rawDate) : new Date(Number.NaN);
      return {
        date,
        runningDistanceMeters: activity.distance ?? 0,
        strengthWorkoutCount: 0,
      };
    })
    .filter((event) => !Number.isNaN(event.date.getTime()));
}

async function fetchHevyEvents(apiToken: string, after: Date, before: Date): Promise<WorkoutEvent[]> {
  const url = new URL(HEVY_WORKOUTS_URL);
  url.searchParams.set("page", "1");
  url.searchParams.set("pageSize", "100");

  const response = await fetch(url, {
    headers: {
      "api-key": apiToken,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Hevy request failed with status ${response.status}.`);
  }

  const workouts = extractHevyWorkouts(await response.json());

  return workouts
    .map((workout) => getWorkoutDate(workout))
    .filter(
      (date): date is Date =>
        date !== null && isDateInRange(date, after, before),
    )
    .map((date) => ({
      date,
      runningDistanceMeters: 0,
      strengthWorkoutCount: 1,
    }));
}

function getWeekMetrics(events: WorkoutEvent[], weekStart: Date) {
  const weekEnd = addWeeks(weekStart, 1);
  const weeklyEvents = events.filter((event) => isDateInRange(event.date, weekStart, weekEnd));

  return {
    runningKm: weeklyEvents.reduce((total, event) => total + event.runningDistanceMeters / METERS_PER_KM, 0),
    strengthWorkouts: weeklyEvents.reduce((total, event) => total + event.strengthWorkoutCount, 0),
    hasQualifyingWorkout: weeklyEvents.some(
      (event) => event.runningDistanceMeters > 0 || event.strengthWorkoutCount > 0,
    ),
  };
}

function calculateWeeklyStreak(events: WorkoutEvent[], currentWeekStart: Date) {
  let streak = 0;

  for (let offset = 0; offset < LOOKBACK_WEEKS; offset += 1) {
    const weekStart = addWeeks(currentWeekStart, -offset);
    if (!getWeekMetrics(events, weekStart).hasQualifyingWorkout) {
      break;
    }
    streak += 1;
  }

  return streak;
}

async function collectFriendMetrics(friend: WorkoutFriend, after: Date, before: Date): Promise<FriendMetrics> {
  const warnings: string[] = [];
  const events: WorkoutEvent[] = [];
  const stravaRefreshToken = friend.stravaRefreshTokenEnv
    ? process.env[friend.stravaRefreshTokenEnv]
    : undefined;
  const hevyToken = friend.hevyApiTokenEnv ? process.env[friend.hevyApiTokenEnv] : undefined;

  if (process.env.NODE_ENV === "development") {
    console.log(`[Strava] ${friend.name}: refresh token exists: ${Boolean(stravaRefreshToken)}`);
  }

  if (stravaRefreshToken) {
    try {
      events.push(
        ...(await fetchStravaEvents(
          friend.name,
          stravaRefreshToken,
          friend.stravaRefreshTokenEnv ?? "STRAVA_REFRESH_TOKEN_<NAME>",
          after,
          before,
        )),
      );
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "Could not load Strava activities.");
    }
  }

  if (hevyToken) {
    try {
      events.push(...(await fetchHevyEvents(hevyToken, after, before)));
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "Could not load Hevy workouts.");
    }
  }

  return { events, warnings };
}

export async function getWorkoutLeaderboard(): Promise<WorkoutLeaderboardResponse> {
  const useMock = process.env.WORKOUT_LEADERBOARD_USE_MOCK !== "false";

  if (useMock) {
    return {
      ...MOCK_RESPONSE,
      updatedAt: new Date().toISOString(),
      weekStartsAt: startOfWeek(new Date()).toISOString(),
      weekEndsAt: addWeeks(startOfWeek(new Date()), 1).toISOString(),
    };
  }

  const now = new Date();
  const currentWeekStart = startOfWeek(now);
  const after = addWeeks(currentWeekStart, -(LOOKBACK_WEEKS - 1));
  const before = addWeeks(currentWeekStart, 1);
  const warnings: string[] = [];

  const leaderboard = await Promise.all(
    WORKOUT_FRIENDS.map(async (friend) => {
      const metrics = await collectFriendMetrics(friend, after, before);
      const currentWeek = getWeekMetrics(metrics.events, currentWeekStart);
      const friendWarnings = metrics.warnings.map((warning) => `${friend.name}: ${warning}`);
      warnings.push(...friendWarnings);

      return {
        id: friend.id,
        name: friend.name,
        runningKmThisWeek: Math.round(currentWeek.runningKm * 100) / 100,
        strengthWorkoutsThisWeek: currentWeek.strengthWorkouts,
        weeklyStreak: calculateWeeklyStreak(metrics.events, currentWeekStart),
        hasStravaConnection: Boolean(friend.stravaRefreshTokenEnv && process.env[friend.stravaRefreshTokenEnv]),
        hasHevyConnection: Boolean(friend.hevyApiTokenEnv && process.env[friend.hevyApiTokenEnv]),
        warnings: friendWarnings,
      };
    }),
  );

  return {
    updatedAt: now.toISOString(),
    weekStartsAt: currentWeekStart.toISOString(),
    weekEndsAt: before.toISOString(),
    source: "api",
    leaderboard: sortLeaderboard(leaderboard),
    warnings,
  };
}
