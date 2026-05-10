export type TransportDeparture = {
  id: string;
  line: string;
  destination: string;
  platform: string;
  minutesUntilDeparture: number;
  status: string;
};

export type WorkoutLeaderboardEntry = {
  id: string;
  name: string;
  runningKmThisWeek: number;
  strengthWorkoutsThisWeek: number;
  weeklyStreak: number;
  hasStravaConnection: boolean;
  hasHevyConnection: boolean;
  warnings: string[];
};

export type WorkoutLeaderboardResponse = {
  updatedAt: string;
  weekStartsAt: string;
  weekEndsAt: string;
  source: "mock" | "api";
  leaderboard: WorkoutLeaderboardEntry[];
  warnings: string[];
};
