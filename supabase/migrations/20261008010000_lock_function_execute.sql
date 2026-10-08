-- Fecha a API REST para funções internas (alertas do Supabase Security Advisor).
-- Funções de trigger não precisam de EXECUTE para disparar.

revoke execute on function handle_new_user(), handle_new_team(), protect_admin_flag(), touch_updated_at()
  from public, anon, authenticated;

-- Usadas pelas políticas de RLS: só usuário logado precisa.
-- is_platform_admin continua liberada para anon porque a política de leitura de planos a avalia (retorna false).
revoke execute on function is_team_member(uuid), is_team_staff(uuid), admin_dashboard_metrics() from public, anon;
grant execute on function is_team_member(uuid), is_team_staff(uuid), admin_dashboard_metrics() to authenticated;
