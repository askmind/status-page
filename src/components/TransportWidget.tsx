"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import type { TransportDeparture } from "@/lib/types";

type TransportResponse = {
  updatedAt: string;
  departures: TransportDeparture[];
};

export default function TransportWidget() {
  const [data, setData] = useState<TransportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDepartures() {
      try {
        const response = await fetch("/api/transport", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Could not load departures.");
        }

        setData(await response.json());
        setError(null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load departures.",
        );
      }
    }

    loadDepartures();
    const timer = window.setInterval(loadDepartures, 45_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <DashboardCard title="Departures" eyebrow="Public transport">
      {error ? <p className="text-xl text-red-200">{error}</p> : null}
      <div className="space-y-4">
        {(data?.departures ?? []).map((departure) => (
          <div
            key={departure.id}
            className="grid grid-cols-[5rem_1fr_auto] items-center gap-4 rounded-md bg-white/[0.07] px-4 py-4"
          >
            <div className="rounded-md bg-amber-300 px-3 py-2 text-center text-2xl font-black text-neutral-950">
              {departure.line}
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-semibold text-white">
                {departure.destination}
              </p>
              <p className="mt-1 text-lg text-neutral-300">
                {departure.platform} · {departure.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold tabular-nums text-white">
                {departure.minutesUntilDeparture}
              </p>
              <p className="text-sm uppercase tracking-[0.16em] text-neutral-300">
                min
              </p>
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
