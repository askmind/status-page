"use client";

import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import type { WeatherForecast } from "@/lib/types";

type WeatherResponse = {
  updatedAt: string;
  forecast: WeatherForecast;
};

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        const response = await fetch("/api/weather", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Could not load weather.");
        }

        setData(await response.json());
        setError(null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load weather.",
        );
      }
    }

    loadWeather();
    const timer = window.setInterval(loadWeather, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const forecast = data?.forecast;

  return (
    <DashboardCard
      title="Weather"
      eyebrow={forecast?.location ?? "Forecast"}
      className="h-full"
    >
      {error ? <p className="text-xl text-red-200">{error}</p> : null}
      {forecast ? (
        <div className="flex h-full flex-col justify-between gap-8">
          <div>
            <p className="text-8xl font-black leading-none text-white sm:text-9xl">
              {forecast.current.temperatureC}°
            </p>
            <p className="mt-3 text-3xl font-semibold text-sky-100">
              {forecast.current.condition}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-lg">
              <div className="rounded-md bg-white/[0.07] p-4">
                <dt className="text-neutral-400">Feels like</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {forecast.current.feelsLikeC}°C
                </dd>
              </div>
              <div className="rounded-md bg-white/[0.07] p-4">
                <dt className="text-neutral-400">Wind</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {forecast.current.windKph} km/h
                </dd>
              </div>
              <div className="rounded-md bg-white/[0.07] p-4">
                <dt className="text-neutral-400">Rain</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {forecast.current.precipitationChance}%
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3">
            {forecast.hourly.map((hour) => (
              <div
                key={hour.time}
                className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 rounded-md bg-white/[0.07] px-4 py-3 text-lg"
              >
                <span className="font-semibold tabular-nums text-neutral-200">
                  {hour.time}
                </span>
                <span className="truncate text-neutral-300">
                  {hour.condition}
                </span>
                <span className="text-2xl font-bold text-white">
                  {hour.temperatureC}°
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </DashboardCard>
  );
}
