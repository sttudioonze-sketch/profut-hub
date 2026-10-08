import type { Plan, Subscriber } from "./types";

// Série mensal reconstruída a partir das assinaturas. Suficiente para o volume do MVP;
// quando crescer, vira uma tabela de snapshots diários.

const TRIAL_DAYS = 14;
const DAY = 86_400_000;
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export type MonthPoint = {
  label: string;
  paying: number;
  trialing: number;
  pastDue: number;
  mrrCents: number;
  newCount: number;
  canceledCount: number;
};

function monthlyPrice(s: Subscriber, plans: Map<string, Plan>) {
  const p = plans.get(s.plan_id);
  if (!p) return 0;
  return s.cycle === "yearly" ? Math.floor(p.price_yearly_cents / 12) : p.price_monthly_cents;
}

export function monthlySeries(subs: Subscriber[], planList: Plan[], now: Date, months = 6): MonthPoint[] {
  const plans = new Map(planList.map((p) => [p.id, p]));
  const out: MonthPoint[] = [];

  for (let k = months - 1; k >= 0; k--) {
    const start = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const nextStart = new Date(now.getFullYear(), now.getMonth() - k + 1, 1);
    // Mês corrente: posição de hoje; meses fechados: último instante do mês
    const at = k === 0 ? now.getTime() : nextStart.getTime() - 1;

    let paying = 0, trialing = 0, pastDue = 0, mrrCents = 0, newCount = 0, canceledCount = 0;

    for (const s of subs) {
      const created = new Date(s.created_at).getTime();
      const canceled = s.canceled_at ? new Date(s.canceled_at).getTime() : null;
      const trialEnd = s.trial_ends_at ? new Date(s.trial_ends_at).getTime() : created + TRIAL_DAYS * DAY;

      if (created >= start.getTime() && created < nextStart.getTime()) newCount++;
      if (canceled && canceled >= start.getTime() && canceled < nextStart.getTime()) canceledCount++;

      if (created > at || (canceled && canceled <= at)) continue;
      if (at < trialEnd) {
        trialing++;
      } else if (s.status !== "trialing" && s.status !== "expired") {
        // Inadimplência só é conhecida no estado atual
        if (k === 0 && s.status === "past_due") pastDue++;
        paying++;
        mrrCents += monthlyPrice(s, plans);
      }
    }

    out.push({ label: MONTHS[start.getMonth()], paying, trialing, pastDue, mrrCents, newCount, canceledCount });
  }

  return out;
}

export function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}
