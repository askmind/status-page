"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import type { NewsItem } from "@/lib/news";

type NewsResponse = { items: NewsItem[]; errors: string[]; message?: string };

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("nb-NO", { hour12: false, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function NewsFeedContent() {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const response = await fetch("/api/news", { cache: "no-store" });
        const json = (await response.json()) as NewsResponse;
        if (!response.ok) throw new Error(json.message ?? "Could not load news feed.");
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load news feed.");
      } finally {
        setLoading(false);
      }
    }

    loadNews();
    const timer = window.setInterval(loadNews, 120_000);
    return () => window.clearInterval(timer);
  }, []);

  const items = useMemo(() => data?.items.slice(0, 25) ?? [], [data]);

  return (
    <>
      {loading ? <p className="text-sm text-neutral-400">Loading live news…</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && items.length === 0 ? <p className="text-sm text-neutral-400">No articles available right now.</p> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-3">
            <p className="text-xs text-neutral-400">{item.source} • {formatTime(item.publishedAt)}</p>
            <a href={item.link} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-semibold text-neutral-100 hover:text-cyan-300">{item.title}</a>
            {item.summary ? <p className="mt-1 text-xs text-neutral-300">{item.summary}</p> : null}
          </article>
        ))}
      </div>
      {data?.errors?.length ? <p className="mt-3 text-xs text-amber-300">Some sources failed: {data.errors.join(", ")}</p> : null}
    </>
  );
}

export default function NewsFeedWidget() {
  return (
    <DashboardCard title="News Feed" eyebrow="Norwegian + Global">
      <NewsFeedContent />
    </DashboardCard>
  );
}
