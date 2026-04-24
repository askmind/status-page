"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import type { CalendarEvent } from "@/lib/types";

const START_HOUR = 7;
const END_HOUR = 23;
const HOUR_HEIGHT = 58;
const MIN_EVENT_HEIGHT = 28;
const DEFAULT_EVENT_COLOR = "#34a853";

type CalendarResponse = {
  updatedAt: string;
  events: CalendarEvent[];
  warnings?: string[];
};

type VisibleEvent = CalendarEvent & {
  startDate: Date;
  endDate: Date;
  startMinute: number;
  endMinute: number;
};

type PositionedEvent = VisibleEvent & {
  top: number;
  height: number;
  column: number;
  columnCount: number;
};

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
}

function dayKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isToday(date: Date) {
  return dayKey(date) === dayKey(new Date());
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

function getMinutesFromStartOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatTimezone(date: Date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  return `GMT${sign}${String(hours).padStart(2, "0")}${
    minutes ? `:${String(minutes).padStart(2, "0")}` : ""
  }`;
}

function formatEventTimeRange(event: VisibleEvent) {
  return `${formatTime(event.startDate)}-${formatTime(event.endDate)}`;
}

function hexToRgba(hex: string | undefined, alpha: number) {
  const fallback = DEFAULT_EVENT_COLOR;
  const normalized = (hex || fallback).replace("#", "");
  const fullHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;

  if (!/^[0-9a-f]{6}$/i.test(fullHex)) {
    return hexToRgba(fallback, alpha);
  }

  const red = Number.parseInt(fullHex.slice(0, 2), 16);
  const green = Number.parseInt(fullHex.slice(2, 4), 16);
  const blue = Number.parseInt(fullHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getEventBounds(event: VisibleEvent) {
  const visibleStart = START_HOUR * 60;
  const visibleEnd = END_HOUR * 60;
  const clippedStart = Math.max(event.startMinute, visibleStart);
  const clippedEnd = Math.min(event.endMinute, visibleEnd);

  if (clippedEnd <= visibleStart || clippedStart >= visibleEnd) {
    return null;
  }

  return {
    top: ((clippedStart - visibleStart) / 60) * HOUR_HEIGHT,
    height: Math.max(
      MIN_EVENT_HEIGHT,
      ((clippedEnd - clippedStart) / 60) * HOUR_HEIGHT,
    ),
  };
}

function getVisibleEvents(events: CalendarEvent[]) {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);

  return events
    .map((event) => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return null;
      }

      return {
        ...event,
        startDate,
        endDate,
        startMinute: (startDate.getTime() - today.getTime()) / 60_000,
        endMinute: (endDate.getTime() - today.getTime()) / 60_000,
      };
    })
    .filter((event): event is VisibleEvent => {
      if (!event) {
        return false;
      }

      return event.startDate < tomorrow && event.endDate > today;
    });
}

function groupOverlappingEvents(events: VisibleEvent[]): PositionedEvent[] {
  const visibleEvents = events
    .map((event) => {
      const bounds = getEventBounds(event);
      return bounds ? { event, bounds } : null;
    })
    .filter(
      (
        item,
      ): item is {
        event: VisibleEvent;
        bounds: { top: number; height: number };
      } => Boolean(item),
    )
    .sort((a, b) => a.event.startMinute - b.event.startMinute);

  const positionedEvents: PositionedEvent[] = [];
  let cluster: typeof visibleEvents = [];
  let clusterEnd = 0;

  function flushCluster() {
    if (!cluster.length) {
      return;
    }

    const columnEnds: number[] = [];
    const clusterEvents: PositionedEvent[] = [];

    for (const item of cluster) {
      let column = columnEnds.findIndex(
        (endMinute) => endMinute <= item.event.startMinute,
      );

      if (column === -1) {
        column = columnEnds.length;
      }

      columnEnds[column] = item.event.endMinute;
      clusterEvents.push({
        ...item.event,
        ...item.bounds,
        column,
        columnCount: 1,
      });
    }

    const columnCount = Math.max(1, columnEnds.length);
    positionedEvents.push(
      ...clusterEvents.map((event) => ({
        ...event,
        columnCount,
      })),
    );

    cluster = [];
    clusterEnd = 0;
  }

  for (const item of visibleEvents) {
    if (!cluster.length || item.event.startMinute < clusterEnd) {
      cluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.event.endMinute);
    } else {
      flushCluster();
      cluster.push(item);
      clusterEnd = item.event.endMinute;
    }
  }

  flushCluster();
  return positionedEvents;
}

function getCurrentTimeTop(now: Date) {
  const minutes = getMinutesFromStartOfDay(now);
  const visibleStart = START_HOUR * 60;
  const visibleEnd = END_HOUR * 60;

  if (minutes < visibleStart || minutes > visibleEnd) {
    return null;
  }

  return ((minutes - visibleStart) / 60) * HOUR_HEIGHT;
}

export default function CalendarWidget() {
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    async function loadCalendar() {
      try {
        const response = await fetch("/api/calendar?days=1", {
          cache: "no-store",
        });

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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const today = startOfToday();
  const visibleEvents = useMemo(() => getVisibleEvents(data?.events ?? []), [
    data,
  ]);
  const allDayEvents = visibleEvents.filter((event) => event.allDay);
  const timedEvents = groupOverlappingEvents(
    visibleEvents.filter((event) => !event.allDay),
  );
  const currentTimeTop = isToday(today) ? getCurrentTimeTop(now) : null;
  const gridHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
  const shownAllDayEvents = allDayEvents.slice(0, 3);
  const hiddenAllDayCount = Math.max(
    0,
    allDayEvents.length - shownAllDayEvents.length,
  );

  return (
    <DashboardCard
      title="Calendar"
      eyebrow="Today"
      className="bg-neutral-950/60 p-3 sm:p-4"
      hideHeader
    >
      <section className="overflow-hidden rounded-lg border border-white/10 bg-neutral-950 text-neutral-100 shadow-inner">
        <div className="grid grid-cols-[4.75rem_1fr] border-b border-white/10 bg-neutral-900">
          <div className="flex items-start justify-end border-r border-white/10 px-2 py-3 text-sm font-semibold text-neutral-400">
            {formatTimezone(today)}
          </div>
          <div className="min-h-14 px-3 py-2">
            {shownAllDayEvents.length ? (
              <div className="flex flex-wrap gap-2">
                {shownAllDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="max-w-full truncate rounded-md border px-3 py-1 text-sm font-semibold"
                    style={{
                      backgroundColor: hexToRgba(event.calendarColor, 0.3),
                      borderColor: event.calendarColor ?? DEFAULT_EVENT_COLOR,
                      color: "#f5f5f5",
                    }}
                  >
                    {event.title || "Untitled event"}
                  </div>
                ))}
                {hiddenAllDayCount ? (
                  <div className="rounded-md bg-white/10 px-3 py-1 text-sm font-semibold text-neutral-200">
                    +{hiddenAllDayCount} more
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm font-medium text-neutral-500">
                No all-day events
              </p>
            )}
          </div>
        </div>

        {error ? (
          <div className="border-b border-red-400/30 bg-red-950/60 px-4 py-3 text-sm font-semibold text-red-100">
            {error}
          </div>
        ) : null}

        <div className="max-h-[44rem] overflow-y-auto bg-neutral-950">
          <div className="grid grid-cols-[4.75rem_1fr]">
            <div
              className="relative border-r border-white/10"
              style={{ height: gridHeight }}
            >
              {Array.from(
                { length: END_HOUR - START_HOUR + 1 },
                (_, index) => {
                  const hour = START_HOUR + index;

                  return (
                    <div
                      key={hour}
                      className="absolute right-2 -translate-y-1/2 text-base font-medium tabular-nums text-neutral-400"
                      style={{ top: index * HOUR_HEIGHT }}
                    >
                      {formatHour(hour)}
                    </div>
                  );
                },
              )}
            </div>

            <div className="relative" style={{ height: gridHeight }}>
              {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => (
                <div
                  key={index}
                  className="absolute left-0 right-0 border-t border-white/10"
                  style={{ top: index * HOUR_HEIGHT }}
                />
              ))}

              {timedEvents.map((event) => {
                const gutter = 6;
              const width = `calc(${100 / event.columnCount}% - ${gutter}px)`;
                const left = `calc(${
                  (event.column * 100) / event.columnCount
                }% + ${gutter / 2}px)`;
                const eventColor = event.calendarColor ?? DEFAULT_EVENT_COLOR;

                return (
                  <article
                    key={event.id}
                    className="absolute overflow-hidden rounded-lg border-l-4 px-2 py-1 shadow-sm"
                    style={{
                      top: event.top,
                      height: event.height,
                      left,
                      width,
                      backgroundColor: hexToRgba(eventColor, 0.34),
                      borderColor: eventColor,
                    }}
                  >
                    <p className="truncate text-sm font-bold leading-tight text-white">
                      {event.title || "Untitled event"}
                    </p>
                    {event.height >= 46 ? (
                      <p className="mt-0.5 truncate text-xs font-medium text-neutral-200">
                        {formatEventTimeRange(event)}
                      </p>
                    ) : null}
                    {event.height >= 64 && event.calendarName ? (
                      <p className="mt-1 truncate text-xs font-medium text-neutral-300">
                        {event.calendarName}
                      </p>
                    ) : null}
                  </article>
                );
              })}

              {currentTimeTop !== null ? (
                <div
                  className="absolute left-0 right-0 z-10 border-t-2 border-red-500"
                  style={{ top: currentTimeTop }}
                >
                  <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
                </div>
              ) : null}

              {!timedEvents.length && !allDayEvents.length && !error ? (
                <div className="absolute left-4 right-4 top-8 rounded-lg border border-dashed border-white/15 bg-white/[0.06] px-4 py-5 text-center text-lg font-semibold text-neutral-300">
                  No events today
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {data ? (
          <footer className="flex items-center justify-between gap-3 border-t border-white/10 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-400">
            <span>
              {data.warnings?.length
                ? `${data.warnings.length} warning(s)`
                : "All calendars synced"}
            </span>
            <span>Updated {new Date(data.updatedAt).toLocaleTimeString()}</span>
          </footer>
        ) : null}
      </section>
    </DashboardCard>
  );
}
