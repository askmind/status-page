import { NextResponse } from "next/server";
import type { CalendarEvent } from "@/lib/types";

const events: CalendarEvent[] = [
  {
    id: "standup",
    title: "Morning check-in",
    startTime: "09:00",
    endTime: "09:20",
    location: "Kitchen table",
  },
  {
    id: "focus",
    title: "Project focus block",
    startTime: "10:00",
    endTime: "12:00",
  },
  {
    id: "walk",
    title: "Lunch walk",
    startTime: "12:30",
    endTime: "13:00",
  },
  {
    id: "dinner",
    title: "Dinner prep",
    startTime: "17:30",
    endTime: "18:15",
  },
];

export async function GET() {
  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    events,
  });
}
