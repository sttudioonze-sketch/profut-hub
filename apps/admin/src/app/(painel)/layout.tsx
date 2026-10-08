import { LogOut } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { isDemo } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { signOut } from "../login/actions";

// Painel interno: renderiza sempre no servidor com a sessão do admin
export const instant = false;

export default async function PainelLayout({ children }: LayoutProps<"/">) {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <Sidebar
        footer={
          <div className="space-y-3">
            <div>
              <p>Atualizado</p>
              <p className="text-sm font-medium text-white">{formatDate(new Date().toISOString())}</p>
            </div>
            {!isDemo && (
              <form action={signOut}>
                <button className="flex items-center gap-2 text-white/70 hover:text-white">
                  <LogOut size={14} /> Sair
                </button>
              </form>
            )}
          </div>
        }
      />
      <main className="min-w-0 flex-1 px-4 py-5 md:px-10 md:py-8">
        {isDemo && (
          <p className="mb-5 rounded-lg border border-brand/30 bg-brand-soft px-3 py-2 text-xs text-graphite">
            Modo demonstração: dados fictícios. Configure o Supabase em <code>.env.local</code> para usar dados reais.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
