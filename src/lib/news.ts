import { NEWS_SOURCES, type NewsSource } from "@/lib/newsSources";

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
};

const ITEM_REGEX = /<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi;

function tagValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return (match?.[1] ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim();
}

function parseDate(raw: string) {
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

function normalizeKey(title: string, link: string) {
  return `${title.toLowerCase().replace(/\W+/g, " ").trim()}|${link.replace(/\?.*$/, "")}`;
}

async function fetchSource(source: NewsSource): Promise<NewsItem[]> {
  const response = await fetch(source.url, { next: { revalidate: 300 } });
  if (!response.ok) return [];
  const xml = await response.text();
  const matches = xml.match(ITEM_REGEX) ?? [];

  return matches
    .map((item, index) => {
      const title = tagValue(item, "title");
      const link = tagValue(item, "link") || item.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?/i)?.[1] || "";
      const published = tagValue(item, "pubDate") || tagValue(item, "published") || tagValue(item, "updated");
      const summary = tagValue(item, "description") || tagValue(item, "summary") || "";
      if (!title || !link) return null;
      return {
        id: `${source.id}-${index}`,
        title,
        link,
        source: source.name,
        publishedAt: parseDate(published),
        summary: summary.slice(0, 240),
      };
    })
    .filter((item): item is NewsItem => Boolean(item));
}

export async function fetchUnifiedNewsFeed(limit = 80) {
  const settled = await Promise.allSettled(NEWS_SOURCES.map(fetchSource));
  const errors: string[] = [];
  const deduped = new Map<string, NewsItem>();

  settled.forEach((result, index) => {
    if (result.status === "rejected") {
      errors.push(`Failed to load ${NEWS_SOURCES[index].name}`);
      return;
    }
    for (const item of result.value) {
      const key = normalizeKey(item.title, item.link);
      if (!deduped.has(key)) deduped.set(key, item);
    }
  });

  const items = [...deduped.values()]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit);

  return { items, errors };
}
