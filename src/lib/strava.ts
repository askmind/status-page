const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
export const STRAVA_ATHLETE_URL = "https://www.strava.com/api/v3/athlete";
export const STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities";
export const RUNNING_ACTIVITY_TYPES = new Set(["Run", "TrailRun", "VirtualRun"]);

type StravaTokenResponse = {
  access_token?: string;
  refresh_token?: string;
};

type StravaErrorResponse = {
  message?: string;
  errors?: Array<{
    resource?: string;
    field?: string;
    code?: string;
  }>;
};

export type StravaActivity = {
  name?: string;
  type?: string;
  sport_type?: string;
  distance?: number;
  start_date?: string;
  start_date_local?: string;
};

type StravaAccessTokenOptions = {
  friendName?: string;
  refreshTokenEnvName?: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
}

function formatStravaError(payload: StravaErrorResponse) {
  const details = payload.errors
    ?.map((error) => [error.resource, error.field, error.code].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(", ");

  return [payload.message, details].filter(Boolean).join(": ");
}

export function isRunningActivity(activity: StravaActivity) {
  return (
    RUNNING_ACTIVITY_TYPES.has(activity.sport_type ?? "") ||
    RUNNING_ACTIVITY_TYPES.has(activity.type ?? "")
  );
}

export async function readSafeResponseBody(response: Response) {
  const body = await response.text();
  if (!body) return "";

  try {
    return JSON.stringify(JSON.parse(body));
  } catch {
    return body;
  }
}

function parseJsonBody(body: string) {
  if (!body) return {};

  try {
    return JSON.parse(body) as StravaTokenResponse & StravaErrorResponse;
  } catch {
    return {};
  }
}

export async function getStravaAccessToken(
  refreshToken: string,
  options: StravaAccessTokenOptions = {},
) {
  const clientId = getRequiredEnv("STRAVA_CLIENT_ID");
  const clientSecret = getRequiredEnv("STRAVA_CLIENT_SECRET");

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  const body = await readSafeResponseBody(response);
  const payload = parseJsonBody(body);

  if (!response.ok) {
    const details = formatStravaError(payload);
    throw new Error(
      [
        `Strava token refresh failed with status ${response.status}.`,
        details,
        body ? `Response body: ${body}` : null,
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  if (!payload.access_token) {
    throw new Error("Strava token refresh response did not include an access token.");
  }

  // TODO: A production app should persist payload.refresh_token when Strava returns
  // a new value. This local dashboard reads refresh tokens from env config.
  if (
    process.env.NODE_ENV === "development" &&
    payload.refresh_token &&
    payload.refresh_token !== refreshToken
  ) {
    console.warn(
      `Strava returned a new refresh token. Update ${
        options.refreshTokenEnvName ?? "STRAVA_REFRESH_TOKEN_<NAME>"
      } in .env.local with the latest refresh token if future requests fail.`,
    );
  }

  if (process.env.NODE_ENV === "development" && options.friendName) {
    console.log(`[Strava] ${options.friendName}: access token refresh succeeded.`);
  }

  return payload.access_token;
}
