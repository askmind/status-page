export type WorkoutFriend = {
  id: string;
  name: string;
  stravaRefreshTokenEnv?: string;
  hevyApiTokenEnv?: string;
};

export const WORKOUT_FRIENDS: WorkoutFriend[] = [
  {
    id: "andre",
    name: "Andre",
    stravaRefreshTokenEnv: "STRAVA_REFRESH_TOKEN_ANDRE",
    hevyApiTokenEnv: "HEVY_API_TOKEN_ANDRE",
  },
  {
    id: "friend_1",
    name: "Friend 1",
    stravaRefreshTokenEnv: "STRAVA_REFRESH_TOKEN_FRIEND_1",
    hevyApiTokenEnv: "HEVY_API_TOKEN_FRIEND_1",
  },
  {
    id: "friend_2",
    name: "Friend 2",
    stravaRefreshTokenEnv: "STRAVA_REFRESH_TOKEN_FRIEND_2",
    hevyApiTokenEnv: "HEVY_API_TOKEN_FRIEND_2",
  },
];
