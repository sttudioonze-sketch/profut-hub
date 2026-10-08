"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-[13px] font-medium text-muted">E-mail</span>
        <input name="email" type="email" required autoComplete="email" className="glass-control mt-1.5 h-10 w-full rounded-xl px-3 text-sm outline-none focus:border-gray-2 focus:bg-white" />
      </label>
      <label className="block">
        <span className="text-[13px] font-medium text-muted">Senha</span>
        <input name="password" type="password" required autoComplete="current-password" className="glass-control mt-1.5 h-10 w-full rounded-xl px-3 text-sm outline-none focus:border-gray-2 focus:bg-white" />
      </label>
      {error && <p className="text-sm text-negative">{error}</p>}
      <button disabled={pending} className="btn-ink mt-2 h-10 w-full rounded-xl px-3 text-sm font-medium disabled:opacity-60">
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
