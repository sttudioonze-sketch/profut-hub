import { paymentStatusLabel, subscriptionStatusLabel } from "@/lib/format";
import type { PaymentStatus, SubscriptionStatus } from "@/lib/types";

// Pílulas no estilo do app: grafite cheia (melhor estado), contorno grafite, contorno cinza
// e contorno vermelho só para o que pede atenção.
const ink = "bg-ink text-white border-ink";
const outline = "bg-white/70 text-foreground border-ink/80";
const quiet = "bg-white/50 text-muted border-gray-3";
const alert = "bg-white/70 text-negative border-brand";

const subscriptionStyle: Record<SubscriptionStatus, string> = {
  active: ink,
  trialing: outline,
  past_due: alert,
  canceled: quiet,
  expired: quiet,
};

const paymentStyle: Record<PaymentStatus, string> = {
  paid: ink,
  pending: outline,
  overdue: alert,
  refunded: quiet,
  canceled: quiet,
};

const base = "inline-flex items-center rounded-full border px-2.5 py-px text-[11.5px] leading-[18px] font-medium whitespace-nowrap";

export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  return <span className={`${base} ${subscriptionStyle[status]}`}>{subscriptionStatusLabel[status]}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <span className={`${base} ${paymentStyle[status]}`}>{paymentStatusLabel[status]}</span>;
}
