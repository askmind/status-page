"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";

const METEOGRAM_URL =
  "https://www.yr.no/en/content/1-211143/meteogram.svg?mode=dark";

export default function WeatherWidget() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey(Date.now());
    const timer = window.setInterval(() => setRefreshKey(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const meteogramUrl = `${METEOGRAM_URL}&refresh=${refreshKey}`;

  return (
    <DashboardCard
      title="Weather"
      eyebrow="Yr forecast"
      className="h-full"
      hideHeader
    >
      <div className="flex h-full min-h-[34rem] items-center overflow-hidden rounded-md bg-black/30 p-2">
        <object
          aria-label="Weather forecast meteogram from Yr"
          className="h-full min-h-[34rem] w-full"
          data={meteogramUrl}
          type="image/svg+xml"
        />
      </div>
    </DashboardCard>
  );
}
