import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { isDemo } from "./env";
import { createClient } from "./supabase/server";

// Garante que quem está no painel é admin da plataforma.
export const requireAdmin = cache(async (): Promise<{ id: string; name: string }> => {
  await connection(); // painel sempre renderiza na hora, com dados atuais
  if (isDemo) return { id: "demo-admin", name: "Luis (demo)" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, is_platform_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_platform_admin) redirect("/login?erro=sem-acesso");

  return { id: user.id, name: profile.full_name || profile.email };
});
