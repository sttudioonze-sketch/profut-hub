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
    <div className="glass-card flex flex-col p-4 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <span className="-mt-0.5 hidden min-[440px]:block">
          <Sparkline values={series} accent={good === false ? "var(--brand)" : undefined} />
        </span>
      </div>
      <p className="mt-3 text-[28px] leading-none font-medium tracking-tight">{value}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
        <span className="text-muted">
          Mês ant. <span className="font-medium text-foreground">{previous}</span>
        </span>
        {change !== null && (
          <span className={`font-medium ${good ? "text-foreground" : "text-negative"}`}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1).replace(".", ",")}%
          </span>
        )}
      </div>
    </div>
  );
}
