import { NextResponse } from "next/server";
import type { WeatherForecast } from "@/lib/types";

const forecast: WeatherForecast = {
  location: "Home",
  current: {
    temperatureC: 8,
    condition: "Partly cloudy",
    feelsLikeC: 6,
    windKph: 12,
    precipitationChance: 20,
  },
  hourly: [
    { time: "09:00", temperatureC: 7, condition: "Cloudy" },
    { time: "12:00", temperatureC: 10, condition: "Partly cloudy" },
    { time: "15:00", temperatureC: 11, condition: "Light rain" },
    { time: "18:00", temperatureC: 9, condition: "Cloudy" },
  ],
};

export async function GET() {
  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    forecast,
  });
}
