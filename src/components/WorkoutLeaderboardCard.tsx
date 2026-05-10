"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import type { WorkoutLeaderboardResponse } from "@/lib/types";

type LeaderboardErrorResponse = {
  message?: string;
};

function formatKm(value: number) {
  return new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);
}

function getErrorMessage(payload: WorkoutLeaderboardResponse | LeaderboardErrorResponse) {
  return "message" in payload && payload.message
    ? payload.message
    : "Could not load workout leaderboard.";
}

export default function WorkoutLeaderboardCard() {
  const [data, setData] = useState<WorkoutLeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const response = await fetch("/api/workouts/leaderboard", {
          cache: "no-store",
        });
        const json = (await response.json()) as
          | WorkoutLeaderboardResponse
          | LeaderboardErrorResponse;

        if (!response.ok) {
          throw new Error(getErrorMessage(json));
        }

        setData(json as WorkoutLeaderboardResponse);
        setError(null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load workout leaderboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
    const timer = window.setInterval(loadLeaderboard, 300_000);
    return () => window.clearInterval(timer);
  }, []);

  const leaderboard = data?.leaderboard ?? [];

  return (
    <DashboardCard
      title="Workout Leaderboard"
      eyebrow="This week"
      className="h-full"
    >
      {loading ? (
        <p className="text-sm text-neutral-400">Loading workouts...</p>
      ) : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && leaderboard.length === 0 ? (
        <p className="text-sm text-neutral-400">No workout data available this week.</p>
      ) : null}

      {leaderboard.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-separate border-spacing-y-2 text-left">
            <thead className="text-xs uppercase tracking-[0.16em] text-neutral-400">
              <tr>
                <th className="w-12 px-2 font-semibold">#</th>
                <th className="px-2 font-semibold">Name</th>
                <th className="px-2 text-right font-semibold">Km løpt</th>
                <th className="px-2 text-right font-semibold">Styrkeøkter</th>
                <th className="px-2 text-right font-semibold">Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((friend, index) => (
                <tr
                  key={friend.id}
                  className="rounded-md bg-white/[0.07] text-sm text-neutral-100"
                >
                  <td className="rounded-l-md px-2 py-2 text-lg font-black text-amber-200">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2">
                    <p className="font-semibold text-white">{friend.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {friend.hasStravaConnection ? "Strava" : "No Strava"} /{" "}
                      {friend.hasHevyConnection ? "Hevy" : "No Hevy"}
                    </p>
                  </td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums">
                    {formatKm(friend.runningKmThisWeek)}
                  </td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums">
                    {friend.strengthWorkoutsThisWeek}
                  </td>
                  <td className="rounded-r-md px-2 py-2 text-right font-semibold tabular-nums">
                    {friend.weeklyStreak}w
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data ? (
        <div className="mt-3 flex flex-col gap-1 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Updated {new Date(data.updatedAt).toLocaleTimeString()}</p>
          <p>{data.source === "mock" ? "Mock data" : "Live API data"}</p>
        </div>
      ) : null}

      {data?.warnings.length ? (
        <p className="mt-2 text-xs text-amber-300">
          {data.warnings.slice(0, 2).join(" ")}
        </p>
      ) : null}
    </DashboardCard>
  );
}
