"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">E-mail</span>
        <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-graphite" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Senha</span>
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-graphite" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
