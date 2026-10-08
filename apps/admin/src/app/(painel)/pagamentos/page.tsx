import Link from "next/link";
import { Card } from "@/components/card";
import { PaymentBadge } from "@/components/status-badge";
import { Topbar } from "@/components/topbar";
import { listPayments } from "@/lib/data";
import { formatBRL, formatDate, paymentMethodLabel } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export default async function PagamentosPage() {
  const [admin, payments] = await Promise.all([requireAdmin(), listPayments({ limit: 200 })]);
  const sum = (status: string) => payments.filter((p) => p.status === status).reduce((s, p) => s + p.amount_cents, 0);

  return (
    <>
      <Topbar title="Pagamentos" user={admin.name} />
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Recebido", value: sum("paid") },
          { label: "Pendente", value: sum("pending") },
          { label: "Vencido", value: sum("overdue"), alert: true },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-border/70 bg-surface p-4">
            <p className="text-[13px] text-muted">{k.label}</p>
            <p className={`mt-1 text-[28px] font-bold leading-none tracking-tight ${k.alert && k.value > 0 ? "text-brand" : ""}`}>
              {formatBRL(k.value)}
            </p>
          </div>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 font-medium">Treinador</th>
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
                  <td className="py-2.5">
                    <Link href={`/assinantes/${p.subscription_id}`} className="font-medium hover:underline">
                      {p.subscriber_name}
                    </Link>
                  </td>
                  <td className="py-2.5">{formatDate(`${p.due_date}T12:00:00-03:00`)}</td>
                  <td className="py-2.5 font-medium">{formatBRL(p.amount_cents)}</td>
                  <td className="py-2.5">{p.method ? paymentMethodLabel[p.method] : "—"}</td>
                  <td className="py-2.5"><PaymentBadge status={p.status} /></td>
                  <td className="py-2.5">{formatDate(p.paid_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <p className="py-8 text-center text-sm text-muted">Nenhum pagamento ainda.</p>}
        </div>
      </Card>
    </>
  );
}
