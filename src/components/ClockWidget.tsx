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
    <div className="rounded-lg border border-white/10 bg-emerald-950/50 p-6 shadow-2xl shadow-black/25 sm:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Today
          </p>
          <p className="mt-2 text-3xl font-medium text-neutral-100 sm:text-5xl">
            {formatted.date}
          </p>
        </div>
        <time
          className="text-6xl font-bold tabular-nums leading-none text-white sm:text-8xl lg:text-9xl"
          dateTime={now?.toISOString()}
        >
          {formatted.time}
        </time>
      </div>
    </div>
  );
}
