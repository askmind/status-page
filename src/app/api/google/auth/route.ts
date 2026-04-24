import { NextResponse } from "next/server";
import {
  getGoogleOAuthClient,
  GOOGLE_CALENDAR_READONLY_SCOPE,
} from "@/lib/googleCalendar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { client, error } = getGoogleOAuthClient();

  if (!client) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GOOGLE_CALENDAR_READONLY_SCOPE],
  });

  return NextResponse.redirect(authUrl);
}
