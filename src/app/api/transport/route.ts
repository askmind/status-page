import { NextResponse } from "next/server";
import type { TransportDeparture } from "@/lib/types";

export const dynamic = "force-dynamic";

const ENTUR_ENDPOINT = "https://api.entur.io/journey-planner/v3/graphql";

const DEPARTURE_QUERY = `
  query Departures($stopPlaceId: String!) {
    stopPlace(id: $stopPlaceId) {
      estimatedCalls(numberOfDepartures: 8, timeRange: 72100) {
        realtime
        aimedDepartureTime
        expectedDepartureTime
        destinationDisplay {
          frontText
        }
        quay {
          id
          name
          publicCode
        }
        serviceJourney {
          id
          line {
            id
            name
            publicCode
          }
        }
      }
    }
  }
`;

type EnturGraphQlResponse = {
  data?: {
    stopPlace: {
      estimatedCalls: EnturEstimatedCall[];
    } | null;
  };
  errors?: Array<{
    message: string;
  }>;
};

type EnturEstimatedCall = {
  realtime: boolean;
  aimedDepartureTime: string;
  expectedDepartureTime?: string | null;
  destinationDisplay?: {
    frontText?: string | null;
  } | null;
  quay?: {
    id: string;
    name?: string | null;
    publicCode?: string | null;
  } | null;
  serviceJourney?: {
    id: string;
    line?: {
      id: string;
      name?: string | null;
      publicCode?: string | null;
    } | null;
  } | null;
};

function minutesUntil(departureTime: string) {
  const departureDate = new Date(departureTime);

  if (Number.isNaN(departureDate.getTime())) {
    return 0;
  }

  return Math.max(0, Math.round((departureDate.getTime() - Date.now()) / 60_000));
}

function mapDeparture(call: EnturEstimatedCall): TransportDeparture {
  const departureTime = call.expectedDepartureTime ?? call.aimedDepartureTime;
  const line = call.serviceJourney?.line;

  return {
    id: `${call.serviceJourney?.id ?? call.quay?.id ?? "departure"}-${departureTime}`,
    line: line?.publicCode ?? line?.name ?? "N/A",
    destination: call.destinationDisplay?.frontText ?? "Unknown destination",
    platform: call.quay?.publicCode ?? call.quay?.name ?? "Platform TBA",
    status: call.realtime ? "Live" : "Scheduled",
    minutesUntilDeparture: minutesUntil(departureTime),
  };
}

function errorResponse(message: string, status: number, details?: string[]) {
  return NextResponse.json(
    {
      error: message,
      details,
      updatedAt: new Date().toISOString(),
      departures: [],
    },
    { status },
  );
}

export async function GET() {
  const clientName = process.env.ENTUR_CLIENT_NAME?.trim();
  const stopPlaceId = process.env.ENTUR_STOP_PLACE_ID?.trim();

  if (!clientName || !stopPlaceId) {
    return errorResponse(
      "Missing Entur configuration. Set ENTUR_CLIENT_NAME and ENTUR_STOP_PLACE_ID.",
      500,
    );
  }

  try {
    const response = await fetch(ENTUR_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ET-Client-Name": clientName,
      },
      body: JSON.stringify({
        query: DEPARTURE_QUERY,
        variables: {
          stopPlaceId,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return errorResponse(
        `Entur request failed with status ${response.status}.`,
        502,
      );
    }

    const payload = (await response.json()) as EnturGraphQlResponse;

    if (payload.errors?.length) {
      return errorResponse(
        "Entur returned GraphQL errors.",
        502,
        payload.errors.map((error) => error.message),
      );
    }

    const calls = payload.data?.stopPlace?.estimatedCalls;

    if (!calls) {
      return errorResponse(
        `No departures found for stop place ${stopPlaceId}.`,
        404,
      );
    }

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      departures: calls.map(mapDeparture),
    });
  } catch (error) {
    return errorResponse(
      "Could not load departures from Entur.",
      502,
      [error instanceof Error ? error.message : "Unknown error"],
    );
  }
}
