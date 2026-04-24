"use client";

import { useEffect, useMemo, useState } from "react";

export default function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatted = useMemo(() => {
    if (!now) {
      return {
        time: "--:--:--",
        date: "Loading today",
      };
    }

    return {
      time: new Intl.DateTimeFormat("en", {
        hourCycle: "h23",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(now),
      date: new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(now),
    };
  }, [now]);

  return (
    <div className="rounded-lg border border-white/10 bg-emerald-950/50 px-4 py-3 shadow-2xl shadow-black/25 sm:px-6">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <p className="text-xl font-medium text-neutral-100 sm:text-2xl lg:text-3xl">
          {formatted.date}
        </p>
        <time
          className="text-3xl font-bold tabular-nums leading-none text-white sm:text-4xl lg:text-5xl"
          dateTime={now?.toISOString()}
        >
          {formatted.time}
        </time>
      </div>
    </div>
  );
}
