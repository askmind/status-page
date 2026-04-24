import { NextResponse } from "next/server";
import type { TransportDeparture } from "@/lib/types";

const departures: TransportDeparture[] = [
  {
    id: "tram-12-1",
    line: "12",
    destination: "City Center",
    platform: "Platform A",
    minutesUntilDeparture: 4,
    status: "On time",
  },
  {
    id: "bus-31-1",
    line: "31",
    destination: "Harbor",
    platform: "Stop 2",
    minutesUntilDeparture: 11,
    status: "On time",
  },
  {
    id: "train-l1-1",
    line: "L1",
    destination: "Airport",
    platform: "Track 3",
    minutesUntilDeparture: 18,
    status: "2 min delay",
  },
  {
    id: "bus-54-1",
    line: "54",
    destination: "North Park",
    platform: "Stop 1",
    minutesUntilDeparture: 26,
    status: "On time",
  },
];

export async function GET() {
  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    departures,
  });
}
