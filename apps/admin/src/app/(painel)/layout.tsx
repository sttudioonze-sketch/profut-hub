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
          <div className="rounded-[14px] border border-white/8 bg-black/50 p-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.55)]">
            <p className="text-[11px] text-menu-muted">Atualizado</p>
            <p className="mt-0.5 text-[13px] font-medium text-[#F5F5F7]">{formatDate(new Date().toISOString())}</p>
            {!isDemo && (
              <form action={signOut} className="mt-3">
                <button className="menu-gloss flex h-9 w-full items-center justify-center gap-2 rounded-[10px] text-[13px] font-medium">
                  <LogOut size={14} /> Sair
                </button>
              </form>
            )}
          </div>
        }
      />
      {/* O aviso de modo demonstração fica logo abaixo da barra superior (ver Topbar) */}
      <main className="min-w-0 flex-1 px-4 pb-8 md:px-8 md:pb-10">{children}</main>
    </div>
  );
}
