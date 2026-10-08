import { Card } from "@/components/card";
import { Topbar } from "@/components/topbar";
import { listPlans } from "@/lib/data";
import { formatBRL } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

const limit = (n: number | null) => (n === null ? "Ilimitado" : String(n));

export default async function PlanosPage() {
  const [admin, plans] = await Promise.all([requireAdmin(), listPlans()]);

  return (
    <>
      <Topbar title="Planos" user={admin.name} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-medium tracking-tight">{p.name}</h2>
              <span className={`rounded-full border px-2.5 py-px text-[11.5px] leading-[18px] font-medium ${p.is_active ? "border-ink bg-ink text-white" : "border-gray-3 bg-white/50 text-muted"}`}>
                {p.is_active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="mt-5 text-[32px] leading-none font-medium tracking-tight">
              {formatBRL(p.price_monthly_cents)}
              <span className="text-sm font-normal text-muted">/mês</span>
            </p>
            <p className="mt-1 text-sm text-muted">ou {formatBRL(p.price_yearly_cents)}/ano</p>
            <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-hairline pt-4 text-sm">
              <div><dt className="text-xs text-muted">Equipes</dt><dd className="font-medium">{limit(p.max_teams)}</dd></div>
              <div><dt className="text-xs text-muted">Atletas/equipe</dt><dd className="font-medium">{limit(p.max_athletes_per_team)}</dd></div>
              <div><dt className="text-xs text-muted">Comissão</dt><dd className="font-medium">{limit(p.max_staff_per_team)}</dd></div>
            </dl>
            <p className="glass-inner mt-4 rounded-xl px-3 py-2.5 text-sm text-muted">
              <span className="font-medium text-foreground">{p.subscriber_count}</span> assinaturas vivas
            </p>
          </Card>
        ))}
      </div>
    </>
  );
}
