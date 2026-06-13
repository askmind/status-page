import { NextResponse } from "next/server";
import { getWorldCupOverview } from "@/lib/worldCup";
import type { WorldCupPhase } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Optional ?phase=group|knockout override, handy for previewing the knockout
  // layout before the real bracket exists. The widget itself never sends it.
  const phaseParam = new URL(request.url).searchParams.get("phase");
  const forcePhase: WorldCupPhase | undefined =
    phaseParam === "group" || phaseParam === "knockout" ? phaseParam : undefined;

  try {
    return NextResponse.json(await getWorldCupOverview({ forcePhase }));
  } catch (error) {
    return NextResponse.json(
      {
        message: "Could not load World Cup data.",
        details: [error instanceof Error ? error.message : "Unknown error"],
        updatedAt: new Date().toISOString(),
        source: "api",
        phase: "group",
        live: [],
        nextUp: [],
        recent: [],
        groups: [],
        knockout: [],
        warnings: [],
      },
      { status: 500 },
    );
  }
}
