type DashboardCardProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  hideHeader?: boolean;
};

export default function DashboardCard({
  title,
  eyebrow,
  children,
  className = "",
  headerClassName = "",
  hideHeader = false,
}: DashboardCardProps) {
  return (
    <article
      className={`rounded-lg border border-white/10 bg-stone-900/80 p-4 shadow-2xl shadow-black/20 sm:p-5 ${className}`}
    >
      {hideHeader ? null : (
        <header
          className={`mb-4 flex items-start justify-between gap-4 ${headerClassName}`}
        >
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
      )}
      {children}
    </article>
  );
}
