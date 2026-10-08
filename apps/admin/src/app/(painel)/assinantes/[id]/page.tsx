import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/card";
import { PaymentBadge, SubscriptionBadge } from "@/components/status-badge";
import { Topbar } from "@/components/topbar";
import { getSubscriber, listPayments, listPlans } from "@/lib/data";
import { isDemo } from "@/lib/env";
import { formatBRL, formatDate, paymentMethodLabel } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { cancelSubscription, changePlan, extendTrial } from "./actions";

export default async function AssinantePage({ params }: PageProps<"/assinantes/[id]">) {
  const { id } = await params;
  const [admin, sub, payments, plans] = await Promise.all([
    requireAdmin(),
    getSubscriber(id),
    listPayments({ subscriptionId: id }),
    listPlans(),
  ]);
  if (!sub) notFound();

  const isLive = ["active", "trialing", "past_due"].includes(sub.status);
  const paid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);

  const field = (label: string, value: React.ReactNode) => (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );

  return (
    <>
      <Link href="/assinantes" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={15} /> Assinantes
      </Link>
      <Topbar title={sub.full_name} user={admin.name} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Assinatura" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            {field("Status", <SubscriptionBadge status={sub.status} />)}
            {field("Plano", sub.plan_name)}
            {field("Ciclo", sub.cycle === "yearly" ? "Anual" : "Mensal")}
            {field("Cliente desde", formatDate(sub.created_at))}
            {field("Fim do teste", formatDate(sub.trial_ends_at))}
            {field("Próxima cobrança", formatDate(sub.current_period_end))}
            {field("E-mail", sub.email)}
            {field("Telefone", sub.phone ?? "—")}
            {field("Equipes", sub.team_count)}
            {sub.canceled_at && field("Cancelado em", formatDate(sub.canceled_at))}
            {field("Total pago", formatBRL(paid))}
          </dl>
        </Card>

        <Card title="Ações" subtitle={isDemo ? "Desativadas no modo demonstração" : "Registradas no histórico do admin"}>
          <fieldset disabled={isDemo} className="space-y-4 text-sm disabled:opacity-50">
            <form action={extendTrial.bind(null, sub.subscription_id)} className="flex gap-2">
              <select name="days" defaultValue="7" className="rounded-lg border border-border bg-white px-2 py-2">
                <option value="7">7 dias</option>
                <option value="14">14 dias</option>
                <option value="30">30 dias</option>
              </select>
              <button className="flex-1 rounded-lg bg-graphite px-3 py-2 font-medium text-white">Estender teste</button>
            </form>
            <form action={changePlan.bind(null, sub.subscription_id)} className="flex gap-2">
              <select name="plan_id" defaultValue={sub.plan_id} className="flex-1 rounded-lg border border-border bg-white px-2 py-2">
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {formatBRL(p.price_monthly_cents)}/mês
                  </option>
                ))}
              </select>
              <button className="rounded-lg border border-graphite px-3 py-2 font-medium">Trocar plano</button>
            </form>
            {isLive && (
              <form action={cancelSubscription.bind(null, sub.subscription_id)}>
                <button className="w-full rounded-lg bg-brand px-3 py-2 font-medium text-white">Cancelar assinatura</button>
              </form>
            )}
          </fieldset>
        </Card>
      </div>

      <Card title="Pagamentos" className="mt-4">
        {payments.length === 0 ? (
          <p className="text-sm text-muted">Nenhum pagamento ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="pb-2 font-medium">Vencimento</th>
                  <th className="pb-2 font-medium">Valor</th>
                  <th className="pb-2 font-medium">Forma</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Pago em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5">{formatDate(`${p.due_date}T12:00:00-03:00`)}</td>
                    <td className="py-2.5 font-medium">{formatBRL(p.amount_cents)}</td>
                    <td className="py-2.5">{p.method ? paymentMethodLabel[p.method] : "—"}</td>
                    <td className="py-2.5"><PaymentBadge status={p.status} /></td>
                    <td className="py-2.5">{formatDate(p.paid_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
