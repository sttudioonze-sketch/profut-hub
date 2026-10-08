"use client";

import { CreditCard, LayoutDashboard, Layers, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Painel",
    items: [{ href: "/", label: "Visão geral", icon: LayoutDashboard }],
  },
  {
    label: "Gestão",
    items: [
      { href: "/assinantes", label: "Assinantes", icon: Users },
      { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
      { href: "/planos", label: "Planos", icon: Layers },
    ],
  },
];

// Menu em vidro preto, igual ao do app do treinador: rótulos cinza, itens cinza-claro e
// item ativo em pílula de vidro escura e brilhante. No celular vira uma barra no topo.
export function Sidebar({ footer }: { footer: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <aside className="menu-glass z-20 flex shrink-0 flex-col border-b text-white md:sticky md:top-0 md:h-screen md:w-60 md:border-r md:border-b-0">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-6">
        {/* Marca em branco sobre o preto */}
        <div className="flex size-7 items-center justify-center rounded-[8px] bg-white text-[11px] font-bold tracking-tight text-ink shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
          PF
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-[#F5F5F7]">ProFut HUB</p>
          <p className="text-[11px] text-menu-muted">Administração</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:gap-0 md:overflow-visible md:pb-0">
        {sections.map((section) => (
          <div key={section.label} className="contents md:mb-5 md:block">
            <p className="hidden px-3 pb-2 text-[11px] font-medium tracking-[0.06em] text-menu-muted uppercase md:block">{section.label}</p>
            <div className="contents md:flex md:flex-col md:gap-1">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-9 shrink-0 items-center gap-3 rounded-[10px] border px-3 text-[13.5px] whitespace-nowrap transition-colors ${
                      active
                        ? "menu-gloss font-medium"
                        : "border-transparent text-menu-text hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.8} className={active ? "text-white" : "text-menu-muted"} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto hidden px-3 pb-4 text-xs text-menu-muted md:block">
        <div className="mb-3 h-px bg-white/7" />
        {footer}
      </div>
    </aside>
  );
}
