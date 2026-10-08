# ProFut HUB

App de assinatura para treinadores de futebol (profissional) organizarem a equipe: organizacional, técnico e tático.

Escopo do MVP: `docs/escopo-mvp.md`. Referências de design: `docs/design/`.

## Estrutura

| Pasta | O que é |
|---|---|
| `apps/admin` | Painel administrativo (Next.js 16): assinantes, pagamentos, planos, métricas |
| `apps/mobile` | App do treinador (Expo / React Native, Android, iOS e web) |
| `supabase/migrations` | Esquema do banco (Postgres/Supabase) com RLS |
| `supabase/tests` | Smoke test do esquema |

## Rodar

```bash
pnpm install
pnpm dev:admin      # http://localhost:3000
pnpm dev:mobile     # Expo (abra no Expo Go ou pressione w para web)
```

Sem as variáveis do Supabase (`apps/admin/.env.example`), o painel roda em **modo demonstração** com dados fictícios. O app ainda usa só dados fictícios.

## Banco

```bash
scripts/test-db.sh   # aplica a migração num Postgres local e roda o smoke test
```

No Supabase: rode `supabase/migrations/*_init.sql` e marque o primeiro admin:

```sql
update profiles set is_platform_admin = true where email = 'seu@email.com';
```

## Decisões

- Público: Brasil. Foco: treinadores profissionais. Cobrança via Asaas (Pix, cartão, boleto), contratada pela web.
- Cadastro de treinador cria 14 dias de teste no plano Pro. Atletas e responsáveis entram por convite e não pagam.
- Visual: vermelho `#EB0D0D`, grafite `#343434`, cinza `#E6E6E6`, Roboto.
