/** Moldura escura do painel da direita — a parte que muda a cada seção. */
export function SectionPanel({
  title,
  subtitle,
  trailing,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-[3px] border border-line bg-panel-2/70 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line px-4 py-3 sm:px-6 sm:py-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-[0.22em] text-bone sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-bone-dim/80">
              {subtitle}
            </p>
          )}
        </div>
        {trailing}
      </header>

      <div className="min-w-0 flex-1 px-4 py-4 sm:px-6">{children}</div>

      {footer && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-6">
          {footer}
        </footer>
      )}
    </section>
  );
}
