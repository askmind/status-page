import { NextResponse } from "next/server";
import { getWorkoutLeaderboard } from "@/lib/workoutLeaderboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getWorkoutLeaderboard());
  } catch (error) {
    return NextResponse.json(
      {
        message: "Could not load workout leaderboard.",
        details: [error instanceof Error ? error.message : "Unknown error"],
        updatedAt: new Date().toISOString(),
        leaderboard: [],
      },
      { status: 500 },
    );
  }
}
