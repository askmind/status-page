"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";

const CAT_ENDPOINTS = ["https://cataas.com/cat", "https://cataas.com/cat/gif"];

const CAPTIONS = [
  "Certified good cat",
  "Mood for today",
  "Important daily update",
];

type CatState = {
  src: string;
  caption: string;
};

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function createCat(): CatState {
  const endpoint = randomItem(CAT_ENDPOINTS);
  const caption = randomItem(CAPTIONS);
  const refreshId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    src: `${endpoint}?refresh=${refreshId}`,
    caption,
  };
}

export default function CatWidget() {
  const [cat, setCat] = useState<CatState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    function loadCat() {
      setIsLoading(true);
      setHasError(false);
      setCat(createCat());
    }

    loadCat();
    const refreshDelay = 60_000 + Math.floor(Math.random() * 60_000);
    const timer = window.setInterval(loadCat, refreshDelay);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <DashboardCard
      title="Today's Cat"
      eyebrow="Very important"
      className="border-rose-300/20 bg-rose-950/35"
      headerClassName="mb-4"
    >
      <div className="overflow-hidden rounded-md border border-white/10 bg-black/25">
        {cat ? (
          <img
            alt={cat.caption}
            className={`aspect-[4/3] w-full object-cover transition-opacity duration-300 ${
              isLoading ? "opacity-40" : "opacity-100"
            }`}
            src={cat.src}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        ) : (
          <div className="aspect-[4/3] animate-pulse bg-white/10" />
        )}
      </div>

      <div className="mt-3 flex min-h-6 items-center justify-between gap-3 text-sm">
        <p className="font-semibold text-rose-100">
          {hasError ? "Cat temporarily unavailable" : cat?.caption}
        </p>
        {isLoading ? (
          <p className="text-rose-200/80">Loading...</p>
        ) : null}
      </div>
    </DashboardCard>
  );
}
