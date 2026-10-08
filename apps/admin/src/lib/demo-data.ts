import type { Payment, Plan, Subscriber, SubscriptionStatus } from "./types";

// Dados fictícios para visualizar o painel sem Supabase configurado.

export const demoPlans: Plan[] = [
  { id: "treinador", name: "Treinador", price_monthly_cents: 3990, price_yearly_cents: 39900, max_teams: 1, max_athletes_per_team: 40, max_staff_per_team: 3, is_active: true },
  { id: "pro", name: "Pro", price_monthly_cents: 7990, price_yearly_cents: 79900, max_teams: 3, max_athletes_per_team: null, max_staff_per_team: null, is_active: true },
];

const names = [
  "Carlos Henrique Souza", "Marcos Vinícius Lima", "Rafael Andrade", "Paulo César Ribeiro", "Thiago Moreira",
  "Eduardo Santos", "Fernando Alves", "Rodrigo Pereira", "Juliano Costa", "André Luiz Martins",
  "Leonardo Ferreira", "Gustavo Rocha", "Ricardo Barbosa", "Fábio Nascimento", "Diego Carvalho",
  "Alexandre Gomes", "Bruno Teixeira", "Márcio Araújo", "Renato Dias", "Vítor Mendes",
  "Sérgio Cardoso", "Felipe Monteiro", "Daniel Correia", "Roberto Pinto",
];

const statuses: SubscriptionStatus[] = [
  "active", "active", "trialing", "active", "past_due", "active", "trialing", "active",
  "canceled", "active", "active", "trialing", "active", "expired", "active", "past_due",
  "active", "trialing", "active", "active", "canceled", "active", "trialing", "active",
];

const DAY = 86_400_000;
// Data fixa para os números da demo não mudarem a cada carregamento
export const demoNow = "2026-10-08T12:00:00-03:00";
const base = new Date(demoNow).getTime();
const iso = (offsetDays: number) => new Date(base + offsetDays * DAY).toISOString();

export const demoSubscribers: Subscriber[] = names.map((full_name, i) => {
  const status = statuses[i];
  const plan = i % 3 === 0 ? demoPlans[0] : demoPlans[1];
  // Teste em andamento: entrou há menos de 14 dias. Demais: entraram entre 20 e 175 dias atrás.
  const trialLeft = (i % 13) + 1;
  const createdOffset = status === "trialing" ? trialLeft - 14 : -20 - ((i * 47) % 156);
  const slug = full_name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return {
    subscription_id: `demo-sub-${i + 1}`,
    owner_id: `demo-user-${i + 1}`,
    full_name,
    email: `${slug}${i + 1}@exemplo.com.br`,
    phone: `(11) 9${String(8000 + ((i * 731) % 2000))}-${String(1000 + ((i * 377) % 9000)).padStart(4, "0")}`,
    plan_id: plan.id,
    plan_name: plan.name,
    status,
    cycle: i % 5 === 0 ? "yearly" : "monthly",
    trial_ends_at: iso(createdOffset + 14),
    current_period_end: status === "active" || status === "past_due" ? iso((i * 7) % 30) : null,
    canceled_at: status === "canceled" ? iso(-((i % 20) + 1)) : null,
    created_at: iso(createdOffset),
    team_count: plan.id === "pro" ? (i % 3) + 1 : 1,
  };
});

export const demoPayments: Payment[] = demoSubscribers
  .filter((s) => s.status !== "trialing")
  .flatMap((s, i) => {
    const plan = demoPlans.find((p) => p.id === s.plan_id)!;
    const amount = s.cycle === "yearly" ? plan.price_yearly_cents : plan.price_monthly_cents;
    const count = s.cycle === "yearly" ? 1 : 3;
    return Array.from({ length: count }, (_, k): Payment => {
      const due = iso(-k * 30 - (i % 10));
      const isLatest = k === 0;
      const status = isLatest && s.status === "past_due" ? "overdue" : "paid";
      return {
        id: `demo-pay-${i}-${k}`,
        subscription_id: s.subscription_id,
        subscriber_name: s.full_name,
        amount_cents: amount,
        status,
        method: (["pix", "credit_card", "boleto"] as const)[(i + k) % 3],
        due_date: due.slice(0, 10),
        paid_at: status === "paid" ? due : null,
      };
    });
  })
  .sort((a, b) => b.due_date.localeCompare(a.due_date));
