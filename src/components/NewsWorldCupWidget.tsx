"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { NewsFeedContent } from "@/components/NewsFeedWidget";
import { WorldCupContent } from "@/components/WorldCupWidget";

const ROTATION_SECONDS = 30;

type ActiveView = "news" | "worldcup";

export default function NewsWorldCupWidget() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Derive the countdown and active view purely from the tick count so there
  // are no nested state updates (which Strict Mode would double-run).
  const countdownSeconds = ROTATION_SECONDS - (elapsedSeconds % ROTATION_SECONDS);
  const activeView: ActiveView =
    Math.floor(elapsedSeconds / ROTATION_SECONDS) % 2 === 0 ? "worldcup" : "news";

  const isNewsActive = activeView === "news";
  const nextView = isNewsActive ? "World Cup" : "News";
  // Seconds since the current view became active — lets the World Cup widget
  // page its group grid in lockstep with this rotation.
  const secondsIntoView = elapsedSeconds % ROTATION_SECONDS;

  return (
    <DashboardCard
      title={isNewsActive ? "News Feed" : "World Cup 2026"}
      className="relative flex h-full min-h-0 flex-col"
      hideHeader
    >
      <span className="pointer-events-none absolute right-3 top-3 z-10 text-[0.7rem] font-medium text-neutral-500">
        {nextView} in {countdownSeconds}s
      </span>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isNewsActive ? (
          <NewsFeedContent />
        ) : (
          <WorldCupContent secondsActive={secondsIntoView} />
        )}
      </div>
    </DashboardCard>
  );
}
