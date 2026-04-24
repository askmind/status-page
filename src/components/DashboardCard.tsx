type DashboardCardProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
};

export default function DashboardCard({
  title,
  eyebrow,
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <article
      className={`rounded-lg border border-white/10 bg-stone-900/80 p-5 shadow-2xl shadow-black/20 sm:p-7 ${className}`}
    >
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h2>
        </div>
      </header>
      {children}
    </article>
  );
}
