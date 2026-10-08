import { redirect } from "next/navigation";
import { isDemo } from "@/lib/env";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  if (isDemo) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="glass-card w-full max-w-sm p-7">
        <div className="mb-7 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-[10px] bg-ink text-xs font-bold tracking-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_12px_rgba(20,20,24,0.18)]">
            PF
          </div>
          <div className="leading-tight">
            <h1 className="text-[17px] font-medium tracking-tight">ProFut HUB</h1>
            <p className="text-xs text-muted">Painel administrativo</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
