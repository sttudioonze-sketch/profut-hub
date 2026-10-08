import { demoNow, demoPayments, demoPlans, demoSubscribers } from "./demo-data";
import { isDemo } from "./env";
import { createClient } from "./supabase/server";
import type { Payment, Plan, Subscriber, SubscriptionStatus } from "./types";

// Dicas de FK explícitas: profiles e teams também se ligam via team_members
const SUBSCRIBER_SELECT =
  "id, owner_id, plan_id, status, cycle, trial_ends_at, current_period_end, canceled_at, created_at, profiles!subscriptions_owner_id_fkey!inner(full_name, email, phone, is_platform_admin, teams!teams_owner_id_fkey(count)), plans(name)";

type SubscriptionRow = {
  id: string;
  owner_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  cycle: Subscriber["cycle"];
  trial_ends_at: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  profiles: { full_name: string; email: string; phone: string | null; teams: { count: number }[] };
  plans: { name: string } | null;
};

function toSubscriber(row: SubscriptionRow): Subscriber {
  return {
    subscription_id: row.id,
    owner_id: row.owner_id,
    full_name: row.profiles.full_name || row.profiles.email,
    email: row.profiles.email,
    phone: row.profiles.phone,
    plan_id: row.plan_id,
    plan_name: row.plans?.name ?? row.plan_id,
    status: row.status,
    cycle: row.cycle,
    trial_ends_at: row.trial_ends_at,
    current_period_end: row.current_period_end,
    canceled_at: row.canceled_at,
    created_at: row.created_at,
    team_count: row.profiles.teams?.[0]?.count ?? 0,
  };
}

// Na demo o "hoje" é fixo para os números não mudarem a cada carregamento
export function currentDate() {
  return isDemo ? new Date(demoNow) : new Date();
}

export async function listSubscribers(opts: { status?: SubscriptionStatus; q?: string } = {}): Promise<Subscriber[]> {
  if (isDemo) {
    const q = opts.q?.toLowerCase();
    return demoSubscribers
      .filter((s) => !opts.status || s.status === opts.status)
      .filter((s) => !q || s.full_name.toLowerCase().includes(q) || s.email.includes(q))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const supabase = await createClient();
  let query = supabase
    .from("subscriptions")
    .select(SUBSCRIBER_SELECT)
    .eq("profiles.is_platform_admin", false) // conta de admin não é assinante
    .order("created_at", { ascending: false });
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.q) {
    const q = opts.q.replace(/[,()%]/g, " ");
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`, { referencedTable: "profiles" });
  }
  const { data, error } = await query.returns<SubscriptionRow[]>();
  if (error) throw error;
  return data.map(toSubscriber);
}

export async function getSubscriber(subscriptionId: string): Promise<Subscriber | null> {
  if (isDemo) return demoSubscribers.find((s) => s.subscription_id === subscriptionId) ?? null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SUBSCRIBER_SELECT)
    .eq("id", subscriptionId)
    .maybeSingle<SubscriptionRow>();
  if (error) throw error;
  return data ? toSubscriber(data) : null;
}

type PaymentRow = Omit<Payment, "subscriber_name"> & {
  subscriptions: { profiles: { full_name: string; email: string } } | null;
};

export async function listPayments(opts: { subscriptionId?: string; limit?: number } = {}): Promise<Payment[]> {
  const limit = opts.limit ?? 100;
  if (isDemo) {
    return demoPayments.filter((p) => !opts.subscriptionId || p.subscription_id === opts.subscriptionId).slice(0, limit);
  }

  const supabase = await createClient();
  let query = supabase
    .from("payments")
    .select("id, subscription_id, amount_cents, status, method, due_date, paid_at, subscriptions(profiles!subscriptions_owner_id_fkey(full_name, email))")
    .order("due_date", { ascending: false })
    .limit(limit);
  if (opts.subscriptionId) query = query.eq("subscription_id", opts.subscriptionId);
  const { data, error } = await query.returns<PaymentRow[]>();
  if (error) throw error;
  return data.map(({ subscriptions, ...p }) => ({
    ...p,
    subscriber_name: subscriptions?.profiles.full_name || subscriptions?.profiles.email || "—",
  }));
}

export async function listPlans(): Promise<(Plan & { subscriber_count: number })[]> {
  if (isDemo) {
    return demoPlans.map((p) => ({
      ...p,
      subscriber_count: demoSubscribers.filter((s) => s.plan_id === p.id && ["active", "trialing", "past_due"].includes(s.status)).length,
    }));
  }

  const supabase = await createClient();
  const [{ data: plans, error }, { data: subs, error: subsError }] = await Promise.all([
    supabase.from("plans").select("*").order("sort_order").returns<Plan[]>(),
    supabase
      .from("subscriptions")
      .select("plan_id, profiles!subscriptions_owner_id_fkey!inner(is_platform_admin)")
      .eq("profiles.is_platform_admin", false)
      .in("status", ["active", "trialing", "past_due"]),
  ]);
  if (error) throw error;
  if (subsError) throw subsError;
  return plans.map((p) => ({ ...p, subscriber_count: subs.filter((s) => s.plan_id === p.id).length }));
}
