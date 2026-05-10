export type NewsSource = {
  id: string;
  name: string;
  url: string;
  region: "no" | "global";
};

export const NEWS_SOURCES: NewsSource[] = [
  { id: "nrk", name: "NRK", url: "https://www.nrk.no/toppsaker.rss", region: "no" },
  { id: "vg", name: "VG", url: "https://www.vg.no/rss/feed/frontpage.rss", region: "no" },
  { id: "aftenposten", name: "Aftenposten", url: "https://www.aftenposten.no/rss", region: "no" },
  { id: "dagbladet", name: "Dagbladet", url: "https://www.dagbladet.no/?service=rss", region: "no" },
  { id: "e24", name: "E24", url: "https://e24.no/rss", region: "no" },
  { id: "tv2", name: "TV 2", url: "https://www.tv2.no/rss/nyheter", region: "no" },
  { id: "nettavisen", name: "Nettavisen", url: "https://www.nettavisen.no/rss", region: "no" },
  { id: "bbc", name: "BBC", url: "https://feeds.bbci.co.uk/news/world/rss.xml", region: "global" },
  { id: "reuters", name: "Reuters", url: "https://www.reutersagency.com/feed/?best-topics=world&post_type=best", region: "global" },
  { id: "ap", name: "AP News", url: "https://apnews.com/hub/ap-top-news?output=1", region: "global" },
  { id: "guardian", name: "The Guardian", url: "https://www.theguardian.com/world/rss", region: "global" },
  { id: "cnn", name: "CNN", url: "https://rss.cnn.com/rss/edition_world.rss", region: "global" },
  { id: "ft", name: "Financial Times", url: "https://www.ft.com/world?format=rss", region: "global" },
  { id: "nyt", name: "The New York Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", region: "global" },
];
