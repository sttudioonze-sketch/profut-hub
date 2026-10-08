import { Search } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/card";
import { SubscriptionBadge } from "@/components/status-badge";
import { Topbar } from "@/components/topbar";
import { listSubscribers } from "@/lib/data";
import { formatDate, subscriptionStatusLabel } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import type { SubscriptionStatus } from "@/lib/types";

const filters: (SubscriptionStatus | undefined)[] = [undefined, "active", "trialing", "past_due", "canceled", "expired"];

export default async function AssinantesPage({ searchParams }: PageProps<"/assinantes">) {
  const sp = await searchParams;
  const status = filters.includes(sp.status as SubscriptionStatus) ? (sp.status as SubscriptionStatus) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [admin, rows] = await Promise.all([requireAdmin(), listSubscribers({ status, q: q || undefined })]);

  const href = (s?: SubscriptionStatus) => {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/assinantes?${qs}` : "/assinantes";
  };

  return (
    <>
      <Topbar title="Assinantes" user={admin.name} />
      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <Link
                key={f ?? "todos"}
                href={href(f)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  f === status
                    ? "btn-ink border-ink"
                    : "glass-control text-foreground hover:bg-white"
                }`}
              >
                {f ? subscriptionStatusLabel[f] : "Todos"}
              </Link>
            ))}
          </div>
          <form className="relative w-full lg:w-72">
            {status && <input type="hidden" name="status" value={status} />}
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome ou e-mail"
              className="glass-control h-10 w-full rounded-xl pr-3 pl-9 text-sm outline-none placeholder:text-muted focus:border-gray-2 focus:bg-white"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs text-muted">
                <th className="pb-2.5 font-medium">Treinador</th>
                <th className="pb-2.5 font-medium">Status</th>
                <th className="pb-2.5 font-medium">Plano</th>
                <th className="pb-2.5 font-medium">Ciclo</th>
                <th className="pb-2.5 font-medium">Equipes</th>
                <th className="pb-2.5 font-medium">Desde</th>
                <th className="pb-2.5 font-medium">Próxima cobrança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rows.map((s) => (
                <tr key={s.subscription_id} className="transition-colors hover:bg-white/50">
                  <td className="py-3">
                    <Link href={`/assinantes/${s.subscription_id}`} className="font-medium underline-offset-2 hover:underline">
                      {s.full_name}
                    </Link>
                    <p className="text-xs text-muted">{s.email}</p>
                  </td>
                  <td className="py-3"><SubscriptionBadge status={s.status} /></td>
                  <td className="py-3">{s.plan_name}</td>
                  <td className="py-3">{s.cycle === "yearly" ? "Anual" : "Mensal"}</td>
                  <td className="py-3">{s.team_count}</td>
                  <td className="py-3">{formatDate(s.created_at)}</td>
                  <td className="py-3">
                    {s.status === "trialing" ? `Teste até ${formatDate(s.trial_ends_at)}` : formatDate(s.current_period_end)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-8 text-center text-sm text-muted">Nenhum assinante encontrado.</p>}
        </div>
        <p className="mt-4 text-xs text-muted">{rows.length} {rows.length === 1 ? "assinante" : "assinantes"}</p>
      </Card>
    </>
  );
}
