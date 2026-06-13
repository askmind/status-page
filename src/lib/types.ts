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

export type WorldCupTeam = {
  name: string;
  tla: string;
  crest: string | null;
};

export type WorldCupMatchStatus = "LIVE" | "FINISHED" | "UPCOMING";

export type WorldCupMatch = {
  id: string;
  status: WorldCupMatchStatus;
  stage: string;
  utcDate: string;
  kickoffLabel: string;
  dateLabel: string;
  minuteLabel: string | null;
  group: string | null;
  home: WorldCupTeam;
  away: WorldCupTeam;
  homeScore: number | null;
  awayScore: number | null;
};

export type WorldCupStandingRow = {
  tla: string;
  name: string;
  crest: string | null;
  played: number;
  goalDifference: number;
  points: number;
};

export type WorldCupGroup = {
  name: string;
  rows: WorldCupStandingRow[];
};

export type WorldCupPhase = "group" | "knockout";

export type WorldCupOverview = {
  updatedAt: string;
  source: "mock" | "api";
  phase: WorldCupPhase;
  live: WorldCupMatch[];
  nextUp: WorldCupMatch[];
  recent: WorldCupMatch[];
  groups: WorldCupGroup[];
  knockout: WorldCupMatch[];
  warnings: string[];
};
