import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { isDemo } from "@/lib/env";

// Barra superior fosca (como a do app) + aviso discreto do modo demonstração logo abaixo.
export function Topbar({
  title,
  user,
  actions,
  back,
}: {
  title: string;
  user: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  const initials = user
    .replace(/\(.*?\)/g, "")
    .split(/[\s@.]+/)
    .filter((p) => /^\p{L}/u.test(p))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <>
      <header className="glass-bar sticky top-0 z-10 -mx-4 mb-6 flex h-16 items-center justify-between gap-4 px-4 md:-mx-8 md:px-8">
        <div className="flex min-w-0 items-center gap-1.5">
          {back && (
            <>
              <Link href={back.href} className="shrink-0 text-[15px] text-muted transition-colors hover:text-foreground">
                {back.label}
              </Link>
              <ChevronRight size={15} className="shrink-0 text-gray-2" />
            </>
          )}
          <h1 className="truncate text-lg font-medium tracking-tight">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {actions}
          <span className="hidden text-[13px] text-muted sm:inline">{user}</span>
          <span className="flex size-9 items-center justify-center rounded-full bg-ink text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_6px_rgba(20,20,24,0.18)]">
            {initials}
          </span>
        </div>
      </header>
      {isDemo && (
        <p className="glass-control mb-5 flex items-center gap-2.5 rounded-2xl md:rounded-full px-3.5 py-1.5 text-xs text-muted-on-page md:w-fit">
          <span className="size-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_0_3px_rgba(235,13,13,0.12)]" />
          <span>
            <span className="font-medium text-foreground">Modo demonstração</span> · dados fictícios. Configure o Supabase em{" "}
            <code className="rounded bg-soft px-1 py-px font-mono text-[11px] text-foreground">.env.local</code> para usar dados reais.
          </span>
        </p>
      )}
    </>
  );
}
