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

  const departures = (data?.departures ?? []).slice(0, 6);

  return (
    <DashboardCard title="Departures" eyebrow="Public transport" hideHeader>
      {error ? <p className="text-xl text-red-200">{error}</p> : null}
      <div className="space-y-1.5">
        {departures.map((departure) => (
          <div
            key={departure.id}
            className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 rounded-md bg-white/[0.07] px-2 py-1.5"
          >
            <div className="rounded-md bg-amber-300 px-1.5 py-1 text-center text-sm font-black text-neutral-950">
              {departure.line}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-white">
                {departure.destination}
              </p>
              <p className="mt-0.5 truncate text-xs text-neutral-300">
                {departure.platform} | {departure.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold leading-none tabular-nums text-white">
                {departure.minutesUntilDeparture}
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-300">
                min
              </p>
            </div>
          </div>
        ))}
      </div>
      {data ? (
        <p className="mt-2 text-xs text-neutral-400">
          Updated {new Date(data.updatedAt).toLocaleTimeString()}
        </p>
      ) : null}
    </DashboardCard>
  );
}
