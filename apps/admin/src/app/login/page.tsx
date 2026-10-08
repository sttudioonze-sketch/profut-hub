import { redirect } from "next/navigation";
import { isDemo } from "@/lib/env";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  if (isDemo) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-lg font-semibold">ProFut HUB</h1>
        <p className="mb-6 text-sm text-muted">Painel administrativo</p>
        <LoginForm />
      </div>
    </main>
  );
}
