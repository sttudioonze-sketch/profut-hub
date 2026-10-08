import type { PaymentMethod, PaymentStatus, SubscriptionStatus } from "./types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });

export const formatBRL = (cents: number) => brl.format(cents / 100);
export const formatDate = (iso: string | null) => (iso ? date.format(new Date(iso)) : "—");

export function daysUntil(iso: string | null) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export const subscriptionStatusLabel: Record<SubscriptionStatus, string> = {
  trialing: "Em teste",
  active: "Ativo",
  past_due: "Inadimplente",
  canceled: "Cancelado",
  expired: "Expirado",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  refunded: "Estornado",
  canceled: "Cancelado",
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  pix: "Pix",
  credit_card: "Cartão",
  boleto: "Boleto",
};
