import { NextResponse, type NextRequest } from "next/server";
import { google, type calendar_v3 } from "googleapis";
import { getGoogleOAuthClient } from "@/lib/googleCalendar";
import type { CalendarEvent } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getRequestedDayCount(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days") ?? "3");

  if (days === 1 || days === 3) {
    return days;
  }

  return 3;
}

function getCalendarRange(dayCount: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + dayCount);

  return { start, end };
}

function dateOnlyToIso(date: string) {
  return new Date(`${date}T00:00:00`).toISOString();
}

type CalendarMetadata = {
  id: string;
  name: string;
  color?: string;
};

function mapGoogleEvent(
  calendar: CalendarMetadata,
  event: calendar_v3.Schema$Event,
  index: number,
): CalendarEvent {
  const allDay = Boolean(event.start?.date);
  const fallbackEventId = `${calendar.id}-calendar-event-${index}`;

  return {
    id: `${calendar.id}:${event.id ?? fallbackEventId}`,
    title: event.summary ?? "Untitled event",
    start: event.start?.date
      ? dateOnlyToIso(event.start.date)
      : event.start?.dateTime ?? new Date().toISOString(),
    end: event.end?.date
      ? dateOnlyToIso(event.end.date)
      : event.end?.dateTime ?? event.start?.dateTime ?? new Date().toISOString(),
    allDay,
    calendarId: calendar.id,
    calendarName: calendar.name,
    calendarColor: calendar.color,
  };
}

function errorResponse(message: string, status: number, details?: string[]) {
  return NextResponse.json(
    {
      error: message,
      details,
      updatedAt: new Date().toISOString(),
      events: [],
      warnings: [],
    },
    { status },
  );
}

function mapCalendarEntry(
  entry: calendar_v3.Schema$CalendarListEntry,
): CalendarMetadata | null {
  if (!entry.id) {
    return null;
  }

  return {
    id: entry.id,
    name: entry.summaryOverride ?? entry.summary ?? entry.id,
    color: entry.backgroundColor ?? undefined,
  };
}

async function listCalendarEntries(
  calendar: calendar_v3.Calendar,
  showHidden: boolean,
) {
  const entries: calendar_v3.Schema$CalendarListEntry[] = [];
  let pageToken: string | undefined;

  do {
    const response = await calendar.calendarList.list({
      maxResults: 250,
      pageToken,
      showHidden,
    });

    entries.push(...(response.data.items ?? []));
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return entries;
}

function parseCalendarIds() {
  const multiCalendarIds = process.env.GOOGLE_CALENDAR_IDS?.trim();

  if (multiCalendarIds) {
    if (multiCalendarIds.toLowerCase() === "all") {
      return { mode: "all" as const, ids: [] };
    }

    return {
      mode: "specific" as const,
      ids: multiCalendarIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    };
  }

  return {
    mode: "specific" as const,
    ids: [process.env.GOOGLE_CALENDAR_ID?.trim() || "primary"],
  };
}

async function resolveCalendars(calendar: calendar_v3.Calendar) {
  const warnings: string[] = [];
  const calendarSelection = parseCalendarIds();
  const entries = await listCalendarEntries(
    calendar,
    calendarSelection.mode === "specific",
  );

  if (calendarSelection.mode === "all") {
    const calendars = entries
      .filter((entry) => entry.selected !== false)
      .map(mapCalendarEntry)
      .filter((entry): entry is CalendarMetadata => Boolean(entry));

    if (!calendars.length) {
      warnings.push("No visible Google calendars were found.");
    }

    return { calendars, warnings };
  }

  const metadataById = new Map(
    entries
      .map(mapCalendarEntry)
      .filter((entry): entry is CalendarMetadata => Boolean(entry))
      .map((entry) => [entry.id, entry]),
  );

  const calendars = calendarSelection.ids.map((id) => {
    const metadata = metadataById.get(id);

    if (!metadata) {
      warnings.push(`Calendar metadata not found for ${id}.`);
    }

    return metadata ?? { id, name: id };
  });

  return { calendars, warnings };
}

async function fetchEventsForCalendar({
  calendar,
  selectedCalendar,
  start,
  end,
}: {
  calendar: calendar_v3.Calendar;
  selectedCalendar: CalendarMetadata;
  start: Date;
  end: Date;
}) {
  const events: CalendarEvent[] = [];
  let pageToken: string | undefined;
  let eventIndex = 0;

  do {
    const response = await calendar.events.list({
      calendarId: selectedCalendar.id,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500,
      pageToken,
    });

    events.push(
      ...(response.data.items ?? []).map((event) =>
        mapGoogleEvent(selectedCalendar, event, eventIndex++),
      ),
    );
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return events;
}

export async function GET(request: NextRequest) {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

  if (!refreshToken) {
    return errorResponse(
      "Missing Google refresh token. Visit /api/google/auth, then copy the refresh token into GOOGLE_REFRESH_TOKEN.",
      500,
    );
  }

  const { client, error } = getGoogleOAuthClient();

  if (!client) {
    return errorResponse(error, 500);
  }

  client.setCredentials({
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({
    version: "v3",
    auth: client,
  });

  const { start, end } = getCalendarRange(getRequestedDayCount(request));

  try {
    const resolved = await resolveCalendars(calendar);
    const warnings = [...resolved.warnings];
    const events: CalendarEvent[] = [];

    for (const selectedCalendar of resolved.calendars) {
      try {
        events.push(
          ...(await fetchEventsForCalendar({
            calendar,
            selectedCalendar,
            start,
            end,
          })),
        );
      } catch (error) {
        warnings.push(
          `Skipped ${selectedCalendar.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }

    events.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      events,
      warnings,
    });
  } catch (error) {
    return errorResponse(
      "Could not load events from Google Calendar.",
      502,
      [error instanceof Error ? error.message : "Unknown error"],
    );
  }
}
