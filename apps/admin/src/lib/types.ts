export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";
export type BillingCycle = "monthly" | "yearly";
export type PaymentStatus = "pending" | "paid" | "overdue" | "refunded" | "canceled";
export type PaymentMethod = "pix" | "credit_card" | "boleto";

export type Plan = {
  id: string;
  name: string;
  price_monthly_cents: number;
  price_yearly_cents: number;
  max_teams: number | null;
  max_athletes_per_team: number | null;
  max_staff_per_team: number | null;
  is_active: boolean;
};

export type Subscriber = {
  subscription_id: string;
  owner_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  plan_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  cycle: BillingCycle;
  trial_ends_at: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  team_count: number;
};

export type Payment = {
  id: string;
  subscription_id: string;
  subscriber_name: string;
  amount_cents: number;
  status: PaymentStatus;
  method: PaymentMethod | null;
  due_date: string;
  paid_at: string | null;
};
