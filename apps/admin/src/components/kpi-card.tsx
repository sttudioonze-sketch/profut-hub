import { Sparkline } from "./charts";

export function KpiCard({
  label,
  value,
  previous,
  change,
  series,
  invert = false,
}: {
  label: string;
  value: string;
  previous: string;
  change: number | null; // variação % vs. mês anterior
  series: number[];
  invert?: boolean; // true quando subir é ruim (inadimplência, cancelamentos)
}) {
  const good = change === null ? null : invert ? change <= 0 : change >= 0;
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] text-muted">{label}</p>
        <span className="hidden min-[440px]:block">
          <Sparkline values={series} color={good === false ? "var(--brand)" : "var(--graphite)"} />
        </span>
      </div>
      <p className="mt-1 text-[28px] font-bold leading-none tracking-tight">{value}</p>
      <div className="mt-3 flex justify-between border-t border-border/70 pt-2 text-xs">
        <span className="text-muted">
          Mês ant.: <span className="font-medium text-foreground">{previous}</span>
        </span>
        {change !== null && (
          <span className={good ? "font-medium text-positive" : "font-medium text-brand"}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1).replace(".", ",")}%
          </span>
        )}
      </div>
    </div>
  );
}
