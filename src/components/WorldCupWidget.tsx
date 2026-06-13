"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import type {
  WorldCupGroup,
  WorldCupMatch,
  WorldCupOverview,
} from "@/lib/types";

type WorldCupErrorResponse = { message?: string };

const GROUPS_PER_PAGE = 6;
const GROUP_PAGE_SECONDS = 15;

const KNOCKOUT_STAGE_LABELS: Record<string, string> = {
  LAST_32: "Round of 32",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarter-finals",
  SEMI_FINALS: "Semi-finals",
  THIRD_PLACE: "Third place",
  FINAL: "Final",
};

function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function MatchRow({ match }: { match: WorldCupMatch }) {
  const isLive = match.status === "LIVE";
  const showScores = match.homeScore !== null || match.awayScore !== null;

  const isUpcoming = match.status === "UPCOMING";
  const meta = isLive
    ? match.minuteLabel ?? "LIVE"
    : match.status === "FINISHED"
      ? "FT"
      : match.kickoffLabel;
  // Upcoming fixtures show the date (they can be days out); played matches keep
  // the group label for standings context.
  const secondary = isUpcoming ? match.dateLabel : match.group;

  return (
    <div className="flex items-stretch gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {[
          { team: match.home, score: match.homeScore },
          { team: match.away, score: match.awayScore },
        ].map(({ team, score }) => (
          <div key={team.tla} className="flex items-center gap-2">
            {team.crest ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.crest} alt="" className="h-4 w-4 shrink-0 object-contain" />
            ) : (
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-sm bg-neutral-700 text-[0.5rem] font-bold text-neutral-200">
                {team.tla.slice(0, 1)}
              </span>
            )}
            <span className="truncate text-sm text-neutral-100">{team.name}</span>
            {showScores ? (
              <span className="ml-auto shrink-0 tabular-nums text-sm font-bold text-white">
                {score ?? 0}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex w-14 shrink-0 flex-col items-end justify-center text-right">
        <span
          className={`text-xs font-semibold ${
            isLive ? "text-red-400" : "text-neutral-300"
          }`}
        >
          {isLive ? "● " : ""}
          {meta}
        </span>
        {secondary ? (
          <span className="truncate text-[0.65rem] text-neutral-500">
            {secondary}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Section({ title, matches }: { title: string; matches: WorldCupMatch[] }) {
  if (matches.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
        {title}
      </p>
      {matches.map((match) => (
        <MatchRow key={match.id} match={match} />
      ))}
    </div>
  );
}

function GroupTable({ group }: { group: WorldCupGroup }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-2">
      <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-neutral-300">
        {group.name}
      </p>
      <table className="w-full text-xs tabular-nums">
        <thead>
          <tr className="text-[0.65rem] uppercase tracking-wide text-neutral-500">
            <th className="text-left font-medium">Team</th>
            <th className="px-1 text-right font-medium">MP</th>
            <th className="px-1 text-right font-medium">GD</th>
            <th className="pl-1 text-right font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((row, index) => (
            <tr
              key={row.tla}
              className={index < 2 ? "text-white" : "text-neutral-400"}
            >
              <td className="py-0.5 text-left font-semibold">{row.tla}</td>
              <td className="px-1 py-0.5 text-right">{row.played}</td>
              <td className="px-1 py-0.5 text-right">
                {formatGoalDifference(row.goalDifference)}
              </td>
              <td className="py-0.5 pl-1 text-right font-bold">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupStandings({
  groups,
  secondsActive,
}: {
  groups: WorldCupGroup[];
  secondsActive?: number;
}) {
  // Fallback timer for standalone use; when the rotation drives the widget it
  // passes secondsActive so paging stays in lockstep with the news hand-off.
  const [internalSeconds, setInternalSeconds] = useState(0);

  useEffect(() => {
    if (secondsActive !== undefined) return;
    const timer = window.setInterval(() => {
      setInternalSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsActive]);

  if (groups.length === 0) return null;

  const pageCount = Math.max(1, Math.ceil(groups.length / GROUPS_PER_PAGE));
  const seconds = secondsActive ?? internalSeconds;
  const page = Math.floor(seconds / GROUP_PAGE_SECONDS) % pageCount;
  const start = page * GROUPS_PER_PAGE;
  const visible = groups.slice(start, start + GROUPS_PER_PAGE);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
          Group standings
        </p>
        {pageCount > 1 ? (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pageCount }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === page ? "bg-amber-200" : "bg-neutral-600"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {visible.map((group) => (
          <GroupTable key={group.name} group={group} />
        ))}
      </div>
    </div>
  );
}

function KnockoutRounds({ matches }: { matches: WorldCupMatch[] }) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Knockout fixtures will appear once the group stage is complete.
      </p>
    );
  }

  // Preserve the bracket order the API already sorted matches into.
  const rounds: Array<{ stage: string; matches: WorldCupMatch[] }> = [];
  for (const match of matches) {
    const last = rounds[rounds.length - 1];
    if (last && last.stage === match.stage) last.matches.push(match);
    else rounds.push({ stage: match.stage, matches: [match] });
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <Section
          key={round.stage}
          title={KNOCKOUT_STAGE_LABELS[round.stage] ?? round.stage}
          matches={round.matches}
        />
      ))}
    </div>
  );
}

export function WorldCupContent({ secondsActive }: { secondsActive?: number }) {
  const [data, setData] = useState<WorldCupOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorldCup() {
      try {
        const response = await fetch("/api/worldcup", { cache: "no-store" });

        // Guard against non-JSON (dev recompile / error pages) so we surface a
        // readable message instead of "Unexpected token '<'".
        const rawBody = await response.text();
        let json: WorldCupOverview | WorldCupErrorResponse;
        try {
          json = JSON.parse(rawBody) as WorldCupOverview | WorldCupErrorResponse;
        } catch {
          throw new Error(`Could not load World Cup data (HTTP ${response.status}).`);
        }

        if (!response.ok) {
          throw new Error(
            "message" in json && json.message
              ? json.message
              : "Could not load World Cup data.",
          );
        }

        setData(json as WorldCupOverview);
        setError(null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load World Cup data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorldCup();
    const timer = window.setInterval(loadWorldCup, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const hasMatches =
    data !== null &&
    (data.live.length > 0 || data.nextUp.length > 0 || data.recent.length > 0);

  return (
    <div className="space-y-4">
      {loading ? <p className="text-sm text-neutral-400">Loading matches…</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && !hasMatches ? (
        <p className="text-sm text-neutral-400">No matches scheduled right now.</p>
      ) : null}

      {data ? (
        <>
          <Section title="Live now" matches={data.live} />
          <Section title="Next up" matches={data.nextUp} />
          <Section title="Recent results" matches={data.recent} />
          {data.phase === "knockout" ? (
            <KnockoutRounds matches={data.knockout} />
          ) : (
            <GroupStandings groups={data.groups} secondsActive={secondsActive} />
          )}
        </>
      ) : null}

      {data?.warnings.length ? (
        <p className="text-xs text-amber-300">{data.warnings.join(" ")}</p>
      ) : null}
    </div>
  );
}

export default function WorldCupWidget() {
  return (
    <DashboardCard title="World Cup 2026" eyebrow="Group stage">
      <WorldCupContent />
    </DashboardCard>
  );
}
