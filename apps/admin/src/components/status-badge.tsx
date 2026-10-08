import { paymentStatusLabel, subscriptionStatusLabel } from "@/lib/format";
import type { PaymentStatus, SubscriptionStatus } from "@/lib/types";

const subscriptionStyle: Record<SubscriptionStatus, string> = {
  active: "bg-graphite text-white",
  trialing: "bg-silver text-graphite",
  past_due: "bg-brand text-white",
  canceled: "bg-transparent text-muted ring-1 ring-border",
  expired: "bg-transparent text-muted ring-1 ring-border",
};

const paymentStyle: Record<PaymentStatus, string> = {
  paid: "bg-graphite text-white",
  pending: "bg-silver text-graphite",
  overdue: "bg-brand text-white",
  refunded: "bg-transparent text-muted ring-1 ring-border",
  canceled: "bg-transparent text-muted ring-1 ring-border",
};

const base = "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  return <span className={`${base} ${subscriptionStyle[status]}`}>{subscriptionStatusLabel[status]}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <span className={`${base} ${paymentStyle[status]}`}>{paymentStatusLabel[status]}</span>;
}
