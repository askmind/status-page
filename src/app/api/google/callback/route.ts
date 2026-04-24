import { NextResponse, type NextRequest } from "next/server";
import { getGoogleOAuthClient } from "@/lib/googleCalendar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function htmlResponse(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function GET(request: NextRequest) {
  const errorParam = request.nextUrl.searchParams.get("error");

  if (errorParam) {
    return htmlResponse(
      `<h1>Google authorization failed</h1><p>${escapeHtml(errorParam)}</p>`,
      400,
    );
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return htmlResponse("<h1>Missing authorization code</h1>", 400);
  }

  const { client, error } = getGoogleOAuthClient();

  if (!client) {
    return htmlResponse(
      `<h1>Configuration error</h1><p>${escapeHtml(error)}</p>`,
      500,
    );
  }

  try {
    const { tokens } = await client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return htmlResponse(
        `<h1>No refresh token returned</h1>
        <p>Visit <code>/api/google/auth</code> again. The route uses <code>prompt=consent</code>, but Google may skip returning a refresh token if this app was already approved.</p>`,
        400,
      );
    }

    return htmlResponse(
      `<main style="font-family: system-ui, sans-serif; max-width: 800px; margin: 48px auto; line-height: 1.5;">
        <h1>Google Calendar refresh token</h1>
        <p>Copy this into <code>.env.local</code> as <code>GOOGLE_REFRESH_TOKEN</code>, then restart the dev server.</p>
        <pre style="white-space: pre-wrap; word-break: break-all; padding: 16px; border-radius: 8px; background: #111827; color: #f9fafb;">GOOGLE_REFRESH_TOKEN=${escapeHtml(refreshToken)}</pre>
      </main>`,
    );
  } catch (error) {
    return htmlResponse(
      `<h1>Token exchange failed</h1><p>${escapeHtml(
        error instanceof Error ? error.message : "Unknown error",
      )}</p>`,
      502,
    );
  }
}
