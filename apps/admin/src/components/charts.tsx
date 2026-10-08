// Gráficos em SVG puro, sem dependências.

const GRAPHITE = "var(--graphite)";
const SERIES = ["var(--graphite)", "var(--brand)", "var(--graphite-2)", "var(--silver)", "#9a9a9a"];

export function Sparkline({ values, color = GRAPHITE }: { values: number[]; color?: string }) {
  const w = 72;
  const h = 28;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
      <polygon points={`0,${h} ${points.join(" ")} ${w},${h}`} fill={color} opacity={0.12} />
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function BarChart({ data, highlightLast = true, format = String }: { data: { label: string; value: number }[]; highlightLast?: boolean; format?: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-48 items-end gap-3">
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium">{format(d.value)}</span>
            <div
              className="w-full rounded-lg"
              style={{
                height: `${Math.max((d.value / max) * 140, 4)}px`,
                background: highlightLast && isLast ? "var(--brand)" : i % 2 ? "var(--graphite)" : "var(--silver)",
              }}
            />
            <span className="text-xs text-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 52;
  const c = 2 * Math.PI * r;
  // Início de cada fatia = soma das anteriores
  const slices = data.map((d, i) => ({
    ...d,
    len: (d.value / total) * c,
    start: data.slice(0, i).reduce((sum, x) => sum + (x.value / total) * c, 0),
  }));
  return (
    <div className="flex items-center gap-6">
      <svg width={140} height={140} viewBox="0 0 140 140" className="shrink-0 -rotate-90">
        <circle cx={70} cy={70} r={r} fill="none" stroke="var(--border)" strokeWidth={22} />
        {slices.map((d, i) => (
          <circle
            key={d.label}
            cx={70}
            cy={70}
            r={r}
            fill="none"
            stroke={SERIES[i % SERIES.length]}
            strokeWidth={22}
            strokeDasharray={`${d.len} ${c - d.len}`}
            strokeDashoffset={-d.start}
          />
        ))}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: SERIES[i % SERIES.length] }} />
            <span className="text-muted">{d.label}</span>
            <span className="font-bold">{((d.value / total) * 100).toFixed(1).replace(".", ",")}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBars({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[96px_1fr] items-center gap-3 text-sm">
          <span className="truncate text-muted">{d.label}</span>
          <div className="h-7 rounded-lg bg-border/60">
            <div
              className="flex h-full min-w-9 items-center justify-end rounded-lg px-2 text-xs font-bold text-white"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color ?? GRAPHITE }}
            >
              {d.value}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
