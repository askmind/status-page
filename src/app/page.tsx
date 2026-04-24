import CalendarWidget from "@/components/CalendarWidget";
import ClockWidget from "@/components/ClockWidget";
import TransportWidget from "@/components/TransportWidget";
import WeatherWidget from "@/components/WeatherWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-5 text-neutral-50 sm:px-8 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1800px] grid-cols-1 gap-5 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-6">
        <section className="lg:col-span-12">
          <ClockWidget />
        </section>

        <section className="grid gap-5 lg:col-span-7 lg:gap-6">
          <TransportWidget />
          <CalendarWidget />
        </section>

        <section className="lg:col-span-5">
          <WeatherWidget />
        </section>
      </div>
    </main>
  );
}
