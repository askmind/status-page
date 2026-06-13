import type {
  WorldCupGroup,
  WorldCupMatch,
  WorldCupMatchStatus,
  WorldCupOverview,
  WorldCupPhase,
  WorldCupStandingRow,
  WorldCupTeam,
} from "@/lib/types";

// football-data.org free tier covers the FIFA World Cup (competition code "WC").
// Get a free token at https://www.football-data.org/client/register and set it
// as FOOTBALL_DATA_API_TOKEN. Without a token we serve sample data so the
// layout still renders.
const WORLD_CUP_MATCHES_URL =
  "https://api.football-data.org/v4/competitions/WC/matches";
const OSLO_TZ = "Europe/Oslo";
const RECENT_RESULT_LIMIT = 3;
const NEXT_UP_LIMIT = 3;

// Knockout stages in bracket order. Anything in this set counts as knockout.
const KNOCKOUT_STAGE_ORDER = [
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
];

type FootballDataTeam = {
  name?: string;
  shortName?: string;
  tla?: string;
  crest?: string | null;
};

type FootballDataMatch = {
  id?: number;
  utcDate?: string;
  status?: string;
  stage?: string;
  minute?: number | string | null;
  group?: string | null;
  homeTeam?: FootballDataTeam;
  awayTeam?: FootballDataTeam;
  score?: { fullTime?: { home?: number | null; away?: number | null } };
};

type WorldCupOptions = {
  forcePhase?: WorldCupPhase;
};

function kickoffLabel(date: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: OSLO_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function dateLabel(date: Date) {
  // Short day.month, e.g. "14.06" — disambiguates fixtures across days.
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: OSLO_TZ,
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function normalizeStatus(rawStatus: string): WorldCupMatchStatus {
  if (rawStatus === "IN_PLAY" || rawStatus === "PAUSED") return "LIVE";
  if (rawStatus === "FINISHED" || rawStatus === "AWARDED") return "FINISHED";
  return "UPCOMING";
}

function isKnockoutStage(stage: string) {
  return KNOCKOUT_STAGE_ORDER.includes(stage);
}

function mapTeam(team: FootballDataTeam | undefined): WorldCupTeam {
  const name = team?.name ?? "TBD";
  const tla =
    team?.tla ?? name.slice(0, 3).toUpperCase().padEnd(3, " ").trim();
  return { name, tla, crest: team?.crest ?? null };
}

function formatGroup(group: string | null | undefined) {
  if (!group) return null;
  // football-data returns values like "GROUP_A"; render as "Group A".
  return group
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapMatch(raw: FootballDataMatch): WorldCupMatch | null {
  if (!raw.utcDate) return null;
  const date = new Date(raw.utcDate);
  if (Number.isNaN(date.getTime())) return null;

  const status = normalizeStatus(raw.status ?? "");
  const minute = raw.minute != null ? String(raw.minute).replace(/'+$/, "") : null;

  return {
    id: String(raw.id ?? raw.utcDate),
    status,
    stage: raw.stage ?? "GROUP_STAGE",
    utcDate: raw.utcDate,
    kickoffLabel: kickoffLabel(date),
    dateLabel: dateLabel(date),
    minuteLabel: status === "LIVE" ? (minute ? `${minute}'` : "LIVE") : null,
    group: formatGroup(raw.group),
    home: mapTeam(raw.homeTeam),
    away: mapTeam(raw.awayTeam),
    homeScore: raw.score?.fullTime?.home ?? null,
    awayScore: raw.score?.fullTime?.away ?? null,
  };
}

type StandingAccumulator = WorldCupStandingRow & { goalsFor: number };

function computeStandings(matches: WorldCupMatch[]): WorldCupGroup[] {
  const groups = new Map<string, Map<string, StandingAccumulator>>();

  const ensureTeam = (groupName: string, team: WorldCupTeam) => {
    if (!groups.has(groupName)) groups.set(groupName, new Map());
    const table = groups.get(groupName)!;
    if (!table.has(team.tla)) {
      table.set(team.tla, {
        tla: team.tla,
        name: team.name,
        crest: team.crest,
        played: 0,
        goalDifference: 0,
        goalsFor: 0,
        points: 0,
      });
    }
    return table.get(team.tla)!;
  };

  for (const match of matches) {
    if (match.stage !== "GROUP_STAGE" || !match.group) continue;

    // Register both teams so even un-played sides appear in the table.
    const home = ensureTeam(match.group, match.home);
    const away = ensureTeam(match.group, match.away);

    if (
      match.status !== "FINISHED" ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      continue;
    }

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    away.goalsFor += match.awayScore;
    home.goalDifference += match.homeScore - match.awayScore;
    away.goalDifference += match.awayScore - match.homeScore;

    if (match.homeScore > match.awayScore) home.points += 3;
    else if (match.homeScore < match.awayScore) away.points += 3;
    else {
      home.points += 1;
      away.points += 1;
    }
  }

  return [...groups.entries()]
    .map(([name, table]) => ({
      name,
      rows: [...table.values()]
        .sort(
          (a, b) =>
            b.points - a.points ||
            b.goalDifference - a.goalDifference ||
            b.goalsFor - a.goalsFor ||
            a.name.localeCompare(b.name),
        )
        .map(
          (row): WorldCupStandingRow => ({
            tla: row.tla,
            name: row.name,
            crest: row.crest,
            played: row.played,
            goalDifference: row.goalDifference,
            points: row.points,
          }),
        ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function sortKnockout(matches: WorldCupMatch[]) {
  return [...matches]
    .filter((match) => isKnockoutStage(match.stage))
    .sort(
      (a, b) =>
        KNOCKOUT_STAGE_ORDER.indexOf(a.stage) -
          KNOCKOUT_STAGE_ORDER.indexOf(b.stage) ||
        a.utcDate.localeCompare(b.utcDate),
    );
}

function detectPhase(matches: WorldCupMatch[]): WorldCupPhase {
  const hasKnockoutMatches = matches.some((match) => isKnockoutStage(match.stage));
  if (!hasKnockoutMatches) return "group";

  const knockoutStarted = matches.some(
    (match) => isKnockoutStage(match.stage) && match.status !== "UPCOMING",
  );
  const groupMatchesRemain = matches.some(
    (match) => match.stage === "GROUP_STAGE" && match.status !== "FINISHED",
  );

  return knockoutStarted || !groupMatchesRemain ? "knockout" : "group";
}

function buildOverview(
  matches: WorldCupMatch[],
  source: "mock" | "api",
  warnings: string[],
  options: WorldCupOptions,
): WorldCupOverview {
  const now = new Date();

  const live = matches
    .filter((match) => match.status === "LIVE")
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));

  const nextUp = matches
    .filter((match) => match.status === "UPCOMING")
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    .slice(0, NEXT_UP_LIMIT);

  const recent = matches
    .filter((match) => match.status === "FINISHED")
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, RECENT_RESULT_LIMIT);

  return {
    updatedAt: now.toISOString(),
    source,
    phase: options.forcePhase ?? detectPhase(matches),
    live,
    nextUp,
    recent,
    groups: computeStandings(matches),
    knockout: sortKnockout(matches),
    warnings,
  };
}

function getMockMatches(): WorldCupMatch[] {
  const now = Date.now();
  const offset = (minutes: number) => new Date(now + minutes * 60_000).toISOString();
  const team = (name: string, tla: string): WorldCupTeam => ({
    name,
    tla,
    crest: null,
  });

  const make = (
    id: string,
    status: WorldCupMatchStatus,
    stage: string,
    minutes: number,
    group: string | null,
    home: WorldCupTeam,
    away: WorldCupTeam,
    hs: number | null,
    as: number | null,
    minuteLabel: string | null = null,
  ): WorldCupMatch => {
    const utc = offset(minutes);
    return {
      id,
      status,
      stage,
      utcDate: utc,
      kickoffLabel: kickoffLabel(new Date(utc)),
      dateLabel: dateLabel(new Date(utc)),
      minuteLabel,
      group: formatGroup(group),
      home,
      away,
      homeScore: hs,
      awayScore: as,
    };
  };

  const NOR = team("Norway", "NOR");
  const BRA = team("Brazil", "BRA");
  const MEX = team("Mexico", "MEX");
  const CRO = team("Croatia", "CRO");
  const ECU = team("Ecuador", "ECU");
  const KSA = team("Saudi Arabia", "KSA");
  const FRA = team("France", "FRA");
  const SEN = team("Senegal", "SEN");
  const ESP = team("Spain", "ESP");
  const USA = team("USA", "USA");
  const ARG = team("Argentina", "ARG");
  const JPN = team("Japan", "JPN");
  const NED = team("Netherlands", "NED");
  const GHA = team("Ghana", "GHA");

  return [
    // Live + today + recent feed.
    make("mock-live", "LIVE", "GROUP_STAGE", -37, "GROUP_C", NOR, BRA, 1, 1, "37'"),
    make("mock-today-1", "UPCOMING", "GROUP_STAGE", 120, "GROUP_A", MEX, CRO, null, null),
    make("mock-today-2", "UPCOMING", "GROUP_STAGE", 300, "GROUP_H", ARG, JPN, null, null),
    // Finished group matches that populate the standings tables.
    make("mock-a-1", "FINISHED", "GROUP_STAGE", -1500, "GROUP_A", MEX, KSA, 3, 0),
    make("mock-a-2", "FINISHED", "GROUP_STAGE", -1400, "GROUP_A", CRO, ECU, 1, 1),
    make("mock-a-3", "FINISHED", "GROUP_STAGE", -180, "GROUP_A", MEX, ECU, 2, 1),
    make("mock-a-4", "FINISHED", "GROUP_STAGE", -120, "GROUP_A", CRO, KSA, 2, 0),
    make("mock-c-1", "FINISHED", "GROUP_STAGE", -1500, "GROUP_C", NOR, GHA, 2, 0),
    make("mock-c-2", "FINISHED", "GROUP_STAGE", -1400, "GROUP_C", BRA, NED, 1, 0),
    make("mock-d-1", "FINISHED", "GROUP_STAGE", -180, "GROUP_D", FRA, SEN, 2, 0),
    make("mock-d-2", "FINISHED", "GROUP_STAGE", -300, "GROUP_D", ESP, USA, 1, 1),
    // Knockout sample (only surfaces when phase is knockout).
    make("mock-r16-1", "FINISHED", "LAST_16", -2000, null, MEX, USA, 2, 1),
    make("mock-r16-2", "FINISHED", "LAST_16", -1900, null, BRA, SEN, 3, 1),
    make("mock-qf-1", "UPCOMING", "QUARTER_FINALS", 1440, null, MEX, BRA, null, null),
    make("mock-final", "UPCOMING", "FINAL", 5760, null, ARG, FRA, null, null),
  ];
}

export async function getWorldCupOverview(
  options: WorldCupOptions = {},
): Promise<WorldCupOverview> {
  const token = process.env.FOOTBALL_DATA_API_TOKEN?.trim();

  if (!token) {
    return buildOverview(
      getMockMatches(),
      "mock",
      ["Showing sample data. Add FOOTBALL_DATA_API_TOKEN for live World Cup matches."],
      options,
    );
  }

  const response = await fetch(WORLD_CUP_MATCHES_URL, {
    headers: { "X-Auth-Token": token },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `football-data.org request failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as { matches?: FootballDataMatch[] };
  const matches = (payload.matches ?? [])
    .map(mapMatch)
    .filter((match): match is WorldCupMatch => match !== null);

  return buildOverview(matches, "api", [], options);
}
