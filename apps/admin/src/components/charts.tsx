// Gráficos em SVG puro, sem dependências. Tons do app: grafite (ink) e cinzas;
// o vermelho da marca só aparece como detalhe pequeno.

const INK = "var(--ink)";
const SERIES = ["var(--ink)", "var(--gray-1)", "var(--gray-2)", "var(--gray-3)", "#E6E6E9"];

// Linha sempre grafite; `accent` pinta só o ponto final (ex.: vermelho quando piorou).
export function Sparkline({ values, color = INK, accent }: { values: number[]; color?: string; accent?: string }) {
  const w = 72;
  const h = 28;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`);
  const last = points.at(-1)?.split(",") ?? ["0", "0"];
  return (
    <svg width={w + 4} height={h} viewBox={`-2 0 ${w + 4} ${h}`} aria-hidden className="shrink-0 overflow-visible">
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill={accent ?? color} stroke="#fff" strokeWidth={1.2} />
    </svg>
  );
}

export function BarChart({ data, highlightLast = true, format = String }: { data: { label: string; value: number }[]; highlightLast?: boolean; format?: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-48 items-end gap-2.5">
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const strong = highlightLast && isLast;
        return (
          <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className={`truncate text-[11px] ${strong ? "font-medium text-foreground" : "text-muted"}`}>{format(d.value)}</span>
            <div
              className="w-full max-w-10 rounded-[8px]"
              style={{
                height: `${Math.max((d.value / max) * 130, 4)}px`,
                background: strong ? "var(--ink)" : "var(--gray-3)",
                boxShadow: strong ? "inset 0 1px 0 rgba(255,255,255,0.18)" : "inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            />
            <span className={`text-[11px] ${strong ? "font-medium text-foreground" : "text-[#6B6B6B]"}`}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 50;
  const c = 2 * Math.PI * r;
  // Pequeno respiro entre as fatias, como no app
  const gap = data.filter((d) => d.value > 0).length > 1 ? 3 : 0;
  // Início de cada fatia = soma das anteriores
  const slices = data.map((d, i) => ({
    ...d,
    len: (d.value / total) * c,
    start: data.slice(0, i).reduce((sum, x) => sum + (x.value / total) * c, 0),
  }));
  return (
    <div className="flex items-center gap-6">
      <svg width={128} height={128} viewBox="0 0 128 128" className="shrink-0 -rotate-90">
        <circle cx={64} cy={64} r={r} fill="none" stroke="var(--track)" strokeWidth={14} />
        {slices.map((d, i) =>
          d.len > 0 ? (
            <circle
              key={d.label}
              cx={64}
              cy={64}
              r={r}
              fill="none"
              stroke={SERIES[i % SERIES.length]}
              strokeWidth={14}
              strokeLinecap="butt"
              strokeDasharray={`${Math.max(d.len - gap, 0.5)} ${c - Math.max(d.len - gap, 0.5)}`}
              strokeDashoffset={-d.start}
            />
          ) : null,
        )}
      </svg>
      <ul className="min-w-0 flex-1 space-y-2 text-[13px]">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: SERIES[i % SERIES.length] }} />
            <span className="truncate">{d.label}</span>
            <span className="ml-auto pl-2 text-muted tabular-nums">{((d.value / total) * 100).toFixed(1).replace(".", ",")}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBars({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3.5">
      {data.map((d) => (
        <li key={d.label} className="text-[13px]">
          <div className="mb-1.5 flex items-center justify-between">
            <span>{d.label}</span>
            <span className="font-medium tabular-nums">{d.value}</span>
          </div>
          <div className="h-2 rounded-full bg-track">
            <div className="h-full rounded-full" style={{ width: `${Math.max((d.value / max) * 100, d.value ? 3 : 0)}%`, background: d.color ?? INK }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
