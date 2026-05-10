"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { NewsFeedContent } from "@/components/NewsFeedWidget";
import { WeatherContent } from "@/components/WeatherWidget";

const ROTATION_SECONDS = 30;

type ActiveView = "news" | "weather";

export default function NewsWeatherWidget() {
  const [activeView, setActiveView] = useState<ActiveView>("news");
  const [countdownSeconds, setCountdownSeconds] = useState(ROTATION_SECONDS);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdownSeconds((currentSeconds) => {
        if (currentSeconds > 1) {
          return currentSeconds - 1;
        }

        setActiveView((currentView) =>
          currentView === "news" ? "weather" : "news",
        );
        return ROTATION_SECONDS;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const isNewsActive = activeView === "news";
  const nextView = isNewsActive ? "Weather" : "News";

  return (
    <DashboardCard
      title={isNewsActive ? "News" : "Weather"}
      eyebrow={isNewsActive ? "Norwegian + Global" : "Yr forecast"}
      className="h-full"
      headerClassName="mb-3"
    >
      <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300">
        <span>Showing {isNewsActive ? "News" : "Weather"}</span>
        <span className="text-right normal-case tracking-normal text-amber-100">
          Switching to {nextView} in {countdownSeconds}s
        </span>
      </div>

      <div className="h-[34rem] overflow-y-auto pr-1 lg:h-[calc(100vh-14rem)] lg:min-h-[34rem]">
        {activeView === "news" ? (
          <NewsFeedContent />
        ) : (
          <WeatherContent />
        )}
      </div>
    </DashboardCard>
  );
}
