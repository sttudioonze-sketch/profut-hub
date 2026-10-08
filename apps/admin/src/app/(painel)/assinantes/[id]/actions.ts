"use server";

import { revalidatePath } from "next/cache";
import { isDemo } from "@/lib/env";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

// Ações manuais do admin. Toda alteração fica registrada em admin_audit_log.
// Mudanças de cobrança no Asaas entram quando a integração for ligada.

async function audit(subscriptionId: string, action: string, details: Record<string, unknown>) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  await supabase.from("admin_audit_log").insert({ admin_id: admin.id, subscription_id: subscriptionId, action, details });
}

export async function extendTrial(subscriptionId: string, formData: FormData) {
  if (isDemo) return;
  await requireAdmin();
  const days = Math.min(Math.max(Number(formData.get("days") ?? 7), 1), 60);
  const supabase = await createClient();
  const { data: sub } = await supabase.from("subscriptions").select("trial_ends_at").eq("id", subscriptionId).single();
  const from = sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date() ? new Date(sub.trial_ends_at) : new Date();
  const trialEndsAt = new Date(from.getTime() + days * 86_400_000).toISOString();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "trialing", trial_ends_at: trialEndsAt })
    .eq("id", subscriptionId);
  if (error) throw error;
  await audit(subscriptionId, "extend_trial", { days, trial_ends_at: trialEndsAt });
  revalidatePath(`/assinantes/${subscriptionId}`);
}

export async function changePlan(subscriptionId: string, formData: FormData) {
  if (isDemo) return;
  await requireAdmin();
  const planId = String(formData.get("plan_id"));
  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").update({ plan_id: planId }).eq("id", subscriptionId);
  if (error) throw error;
  await audit(subscriptionId, "change_plan", { plan_id: planId });
  revalidatePath(`/assinantes/${subscriptionId}`);
}

export async function cancelSubscription(subscriptionId: string) {
  if (isDemo) return;
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled", canceled_at: new Date().toISOString() })
    .eq("id", subscriptionId);
  if (error) throw error;
  await audit(subscriptionId, "cancel", {});
  revalidatePath(`/assinantes/${subscriptionId}`);
}
