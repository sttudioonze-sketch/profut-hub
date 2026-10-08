// Card de vidro branco fosco do app (raio 20, borda branca, brilho em cima).
export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass-card p-5 ${className}`}>
      {title && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] leading-tight font-medium">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
