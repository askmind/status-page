import { google } from "googleapis";

export const GOOGLE_CALENDAR_READONLY_SCOPE =
  "https://www.googleapis.com/auth/calendar.readonly";

type GoogleOAuthClientResult =
  | {
      client: InstanceType<typeof google.auth.OAuth2>;
      error: null;
    }
  | {
      client: null;
      error: string;
    };

export function getGoogleOAuthClient(): GoogleOAuthClientResult {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    return {
      client: null,
      error:
        "Missing Google OAuth configuration. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.",
    };
  }

  return {
    client: new google.auth.OAuth2(clientId, clientSecret, redirectUri),
    error: null,
  };
}
