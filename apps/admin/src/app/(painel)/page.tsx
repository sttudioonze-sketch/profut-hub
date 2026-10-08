import Link from "next/link";
import { Card } from "@/components/card";
import { BarChart, Donut, HBars } from "@/components/charts";
import { KpiCard } from "@/components/kpi-card";
import { SubscriptionBadge } from "@/components/status-badge";
import { Topbar } from "@/components/topbar";
import { monthlySeries, pctChange } from "@/lib/analytics";
import { currentDate, listPlans, listSubscribers } from "@/lib/data";
import { formatBRL, formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export default async function VisaoGeralPage() {
  const [admin, subs, plans] = await Promise.all([requireAdmin(), listSubscribers(), listPlans()]);
  const now = currentDate();
  const series = monthlySeries(subs, plans, now);
  const cur = series.at(-1)!;
  const prev = series.at(-2)!;

  const count = (status: string) => subs.filter((s) => s.status === status).length;
  const live = subs.filter((s) => ["active", "trialing", "past_due"].includes(s.status));
  const paying = subs.filter((s) => s.status === "active" || s.status === "past_due");

  // Dos que já terminaram o teste, quantos viraram pagantes (inclui quem cancelou depois)
  const finishedTrials = subs.filter((s) => s.status !== "trialing");
  const converted = finishedTrials.filter((s) => s.status !== "expired").length;
  const trialConversion = finishedTrials.length
    ? `${((converted / finishedTrials.length) * 100).toFixed(0)}%`
    : "—";

  const endingTrials = subs
    .filter((s) => s.status === "trialing")
    .sort((a, b) => (a.trial_ends_at ?? "").localeCompare(b.trial_ends_at ?? ""))
    .slice(0, 6);

  return (
    <>
      <Topbar title="Visão geral" user={admin.name} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Pagantes"
          value={String(cur.paying)}
          previous={String(prev.paying)}
          change={pctChange(cur.paying, prev.paying)}
          series={series.map((p) => p.paying)}
        />
        <KpiCard
          label="MRR"
          value={formatBRL(cur.mrrCents)}
          previous={formatBRL(prev.mrrCents)}
          change={pctChange(cur.mrrCents, prev.mrrCents)}
          series={series.map((p) => p.mrrCents)}
        />
        <KpiCard
          label="Em teste"
          value={String(count("trialing"))}
          previous={String(prev.trialing)}
          change={pctChange(count("trialing"), prev.trialing)}
          series={series.map((p) => p.trialing)}
        />
        <KpiCard
          label="Novos no mês"
          value={String(cur.newCount)}
          previous={String(prev.newCount)}
          change={pctChange(cur.newCount, prev.newCount)}
          series={series.map((p) => p.newCount)}
        />
        <KpiCard
          label="Cancelamentos"
          value={String(cur.canceledCount)}
          previous={String(prev.canceledCount)}
          change={pctChange(cur.canceledCount, prev.canceledCount)}
          series={series.map((p) => p.canceledCount)}
          invert
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Receita mensal por mês" subtitle="MRR no fim de cada mês, últimos 6 meses">
          <BarChart
            data={series.map((p) => ({ label: p.label, value: p.mrrCents }))}
            format={(v) => `R$ ${Math.round(v / 100).toLocaleString("pt-BR")}`}
          />
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border/70 pt-4">
            <div>
              <dt className="text-xs text-muted">Receita anual projetada</dt>
              <dd className="mt-1 text-xl font-bold tracking-tight">{formatBRL(cur.mrrCents * 12)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Ticket médio</dt>
              <dd className="mt-1 text-xl font-bold tracking-tight">{formatBRL(cur.paying ? Math.round(cur.mrrCents / cur.paying) : 0)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Conversão do teste</dt>
              <dd className="mt-1 text-xl font-bold tracking-tight">{trialConversion}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Inadimplência</dt>
              <dd className={`mt-1 text-xl font-bold tracking-tight ${count("past_due") ? "text-brand" : ""}`}>
                {paying.length ? `${((count("past_due") / paying.length) * 100).toFixed(1).replace(".", ",")}%` : "0%"}
              </dd>
            </div>
          </dl>
        </Card>
        <Card title="Assinaturas por plano" subtitle="Ativas, em teste e inadimplentes">
          <Donut data={plans.map((p) => ({ label: p.name, value: live.filter((s) => s.plan_id === p.id).length }))} />
          <div className="mt-5 border-t border-border/70 pt-4">
            <p className="mb-3 text-xs text-muted">Ciclo de cobrança dos pagantes</p>
            <Donut
              data={[
                { label: "Mensal", value: paying.filter((s) => s.cycle === "monthly").length },
                { label: "Anual", value: paying.filter((s) => s.cycle === "yearly").length },
              ]}
            />
          </div>
        </Card>
        <Card title="Status das assinaturas" subtitle="Situação atual de todas as contas">
          <HBars
            data={[
              { label: "Ativo", value: count("active") },
              { label: "Em teste", value: count("trialing"), color: "var(--graphite-2)" },
              { label: "Inadimplente", value: count("past_due"), color: "var(--brand)" },
              { label: "Cancelado", value: count("canceled"), color: "#9a9a9a" },
              { label: "Expirado", value: count("expired"), color: "#b5b5b5" },
            ]}
          />
          <div className="mt-6 border-t border-border/70 pt-4">
            <p className="mb-3 text-xs text-muted">Novos assinantes por mês</p>
            <BarChart data={series.map((p) => ({ label: p.label, value: p.newCount }))} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Testes terminando em breve" subtitle="Contato antes do fim do teste aumenta a conversão" className="lg:col-span-2">
          <SubscriberTable rows={endingTrials} now={now} />
        </Card>
        <Card title="Inadimplentes" subtitle="Pagamento vencido, conta ainda ativa">
          <ul className="divide-y divide-border/70">
            {subs
              .filter((s) => s.status === "past_due")
              .map((s) => (
                <li key={s.subscription_id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/assinantes/${s.subscription_id}`} className="truncate font-medium hover:underline">
                    {s.full_name}
                  </Link>
                  <span className="shrink-0 text-xs text-muted">{s.plan_name}</span>
                </li>
              ))}
          </ul>
          {count("past_due") === 0 && <p className="text-sm text-muted">Nenhum inadimplente.</p>}
        </Card>
      </div>
    </>
  );
}

function SubscriberTable({ rows, now }: { rows: Awaited<ReturnType<typeof listSubscribers>>; now: Date }) {
  if (rows.length === 0) return <p className="text-sm text-muted">Nenhum teste em andamento.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="pb-2 font-medium">Treinador</th>
            <th className="pb-2 font-medium">Plano</th>
            <th className="pb-2 font-medium">Fim do teste</th>
            <th className="pb-2 text-right font-medium">Restam</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {rows.map((s) => {
            const days = s.trial_ends_at ? Math.ceil((new Date(s.trial_ends_at).getTime() - now.getTime()) / 86_400_000) : null;
            return (
              <tr key={s.subscription_id}>
                <td className="py-2.5">
                  <Link href={`/assinantes/${s.subscription_id}`} className="font-medium hover:underline">
                    {s.full_name}
                  </Link>
                  <p className="text-xs text-muted">{s.email}</p>
                </td>
                <td className="py-2.5">
                  <SubscriptionBadge status={s.status} /> <span className="ml-1 text-muted">{s.plan_name}</span>
                </td>
                <td className="py-2.5">{formatDate(s.trial_ends_at)}</td>
                <td className={`py-2.5 text-right font-bold ${days !== null && days <= 3 ? "text-brand" : ""}`}>
                  {days === null ? "—" : `${days} ${days === 1 ? "dia" : "dias"}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
