"use client";

import { CreditCard, LayoutDashboard, Layers, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/assinantes", label: "Assinantes", icon: Users },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/planos", label: "Planos", icon: Layers },
];

export function Sidebar({ footer }: { footer: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <aside className="flex shrink-0 flex-col bg-graphite text-white md:min-h-screen md:w-60">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand text-sm font-bold">PF</div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight">ProFut HUB</p>
          <p className="text-xs text-white/60">Administração</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-white/12 font-medium text-white" : "text-white/70 hover:bg-white/6 hover:text-white"
              }`}
            >
              <Icon size={17} className={active ? "text-brand" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-white/10 px-5 py-4 text-xs text-white/60 md:block">{footer}</div>
    </aside>
  );
}
