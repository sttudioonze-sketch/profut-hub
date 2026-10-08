export function Card({ title, subtitle, children, className = "" }: { title?: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border/70 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      {title && (
        <header className="mb-4">
          <h2 className="text-[15px] font-bold leading-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
