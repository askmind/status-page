"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import type { CalendarEvent } from "@/lib/types";

type CalendarResponse = {
  updatedAt: string;
  events: CalendarEvent[];
};

export default function CalendarWidget() {
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCalendar() {
      try {
        const response = await fetch("/api/calendar", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Could not load calendar.");
        }

        setData(await response.json());
        setError(null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load calendar.",
        );
      }
    }

    loadCalendar();
    const timer = window.setInterval(loadCalendar, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <DashboardCard title="Today" eyebrow="Calendar">
      {error ? <p className="text-xl text-red-200">{error}</p> : null}
      <div className="space-y-4">
        {(data?.events ?? []).map((event) => (
          <div
            key={event.id}
            className="grid grid-cols-[8rem_1fr] gap-4 rounded-md bg-white/[0.07] px-4 py-4"
          >
            <div className="text-xl font-bold tabular-nums text-emerald-100">
              {event.startTime}
              <span className="block text-base font-medium text-neutral-400">
                {event.endTime}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-semibold text-white">
                {event.title}
              </p>
              {event.location ? (
                <p className="mt-1 text-lg text-neutral-300">{event.location}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {data ? (
        <p className="mt-5 text-sm text-neutral-400">
          Updated {new Date(data.updatedAt).toLocaleTimeString()}
        </p>
      ) : null}
    </DashboardCard>
  );
}
