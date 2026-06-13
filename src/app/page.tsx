import CatWidget from "@/components/CatWidget";
import ClockWidget from "@/components/ClockWidget";
import NewsWorldCupWidget from "@/components/NewsWorldCupWidget";
import TransportWidget from "@/components/TransportWidget";
import WeatherWorkoutWidget from "@/components/WeatherWorkoutWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-4 text-neutral-50 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1800px] grid-cols-1 gap-4 lg:h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-3rem)] lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-5 lg:overflow-hidden">
        <section className="lg:col-span-12">
          <ClockWidget />
        </section>

        <section className="lg:col-span-4 lg:min-h-0">
          <NewsWorldCupWidget />
        </section>

        <section className="grid gap-4 lg:col-span-8 lg:min-h-0 lg:grid-rows-[auto_1fr] lg:gap-5">
          <div className="grid gap-4 xl:grid-cols-2 xl:gap-5">
            <TransportWidget />
            <CatWidget />
          </div>
          <WeatherWorkoutWidget />
        </section>
      </div>
    </main>
  );
}
