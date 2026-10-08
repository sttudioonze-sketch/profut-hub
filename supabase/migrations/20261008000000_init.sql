-- ProFut HUB · esquema inicial
-- Assinaturas (painel admin) + núcleo de equipe (dashboard do app)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'expired');
create type billing_cycle as enum ('monthly', 'yearly');
create type payment_status as enum ('pending', 'paid', 'overdue', 'refunded', 'canceled');
create type payment_method as enum ('pix', 'credit_card', 'boleto');
create type team_role as enum ('head_coach', 'staff', 'athlete', 'guardian');
create type athlete_status as enum ('active', 'injured', 'suspended', 'loaned', 'inactive');
create type event_type as enum ('training', 'match', 'other');
create type rsvp_status as enum ('pending', 'yes', 'no', 'maybe');

-- ---------------------------------------------------------------------------
-- Perfis e assinaturas
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  document text, -- CPF/CNPJ, exigido pelo Asaas para cobrança
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table plans (
  id text primary key,
  name text not null,
  price_monthly_cents integer not null,
  price_yearly_cents integer not null,
  max_teams integer, -- null = ilimitado
  max_athletes_per_team integer,
  max_staff_per_team integer,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

insert into plans (id, name, price_monthly_cents, price_yearly_cents, max_teams, max_athletes_per_team, max_staff_per_team, sort_order) values
  ('treinador', 'Treinador', 3990, 39900, 1, 40, 3, 1),
  ('pro', 'Pro', 7990, 79900, 3, null, null, 2);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  plan_id text not null references plans (id),
  status subscription_status not null default 'trialing',
  cycle billing_cycle not null default 'monthly',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  asaas_customer_id text,
  asaas_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uma assinatura viva por treinador
create unique index subscriptions_one_live_per_owner
  on subscriptions (owner_id)
  where status in ('trialing', 'active', 'past_due');

create table payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions (id) on delete cascade,
  amount_cents integer not null,
  status payment_status not null default 'pending',
  method payment_method,
  due_date date not null,
  paid_at timestamptz,
  asaas_payment_id text unique,
  created_at timestamptz not null default now()
);

-- Registro de ações manuais do admin (estender teste, cancelar, trocar plano)
create table admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid not null references profiles (id),
  subscription_id uuid references subscriptions (id) on delete set null,
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Equipe
-- ---------------------------------------------------------------------------

create table teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  category text not null default 'Profissional',
  season text,
  crest_url text,
  created_at timestamptz not null default now()
);

create table team_members (
  team_id uuid not null references teams (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role team_role not null,
  staff_title text, -- ex.: Auxiliar técnico, Preparador físico
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table athletes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  user_id uuid references profiles (id) on delete set null, -- quando o atleta aceita o convite
  full_name text not null,
  nickname text,
  position text,
  dominant_foot text check (dominant_foot in ('right', 'left', 'both')),
  shirt_number smallint,
  birth_date date,
  photo_url text,
  status athlete_status not null default 'active',
  status_note text, -- ex.: "Lesão muscular, retorno previsto 20/10"
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  type event_type not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  opponent text,
  is_home boolean,
  goals_for smallint,
  goals_against smallint,
  notes text,
  created_at timestamptz not null default now()
);

create index events_team_starts on events (team_id, starts_at);

create table attendance (
  event_id uuid not null references events (id) on delete cascade,
  athlete_id uuid not null references athletes (id) on delete cascade,
  rsvp rsvp_status not null default 'pending',
  present boolean,
  primary key (event_id, athlete_id)
);

-- ---------------------------------------------------------------------------
-- Funções auxiliares de permissão
-- ---------------------------------------------------------------------------

create or replace function is_platform_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_platform_admin from profiles where id = auth.uid()), false);
$$;

create or replace function is_team_member(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid());
$$;

create or replace function is_team_staff(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from team_members
    where team_id = t and user_id = auth.uid() and role in ('head_coach', 'staff')
  );
$$;

-- ---------------------------------------------------------------------------
-- Cadastro: cria perfil e 14 dias de teste do plano Pro
-- ---------------------------------------------------------------------------

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));

  -- Atletas e responsáveis entram por convite e não ganham assinatura
  if coalesce(new.raw_user_meta_data ->> 'signup_as', 'coach') = 'coach' then
    insert into subscriptions (owner_id, plan_id, status, trial_ends_at)
    values (new.id, 'pro', 'trialing', now() + interval '14 days');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Quem cria a equipe vira treinador principal dela
create or replace function handle_new_team() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into team_members (team_id, user_id, role) values (new.id, new.owner_id, 'head_coach');
  return new;
end;
$$;

create trigger on_team_created
  after insert on teams
  for each row execute function handle_new_team();

create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_touch
  before update on subscriptions
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------------
-- Métricas do painel admin
-- ---------------------------------------------------------------------------

create or replace function admin_dashboard_metrics()
returns table (
  active_count bigint,
  trialing_count bigint,
  past_due_count bigint,
  canceled_last_30d bigint,
  new_last_30d bigint,
  mrr_cents bigint
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_platform_admin() then
    raise exception 'forbidden';
  end if;

  return query
  select
    count(*) filter (where s.status = 'active'),
    count(*) filter (where s.status = 'trialing'),
    count(*) filter (where s.status = 'past_due'),
    count(*) filter (where s.canceled_at >= now() - interval '30 days'),
    count(*) filter (where s.created_at >= now() - interval '30 days'),
    coalesce(sum(
      case
        when s.status in ('active', 'past_due') and s.cycle = 'monthly' then p.price_monthly_cents
        when s.status in ('active', 'past_due') and s.cycle = 'yearly' then p.price_yearly_cents / 12
        else 0
      end
    ), 0)::bigint
  from subscriptions s
  join plans p on p.id = s.plan_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table admin_audit_log enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table athletes enable row level security;
alter table events enable row level security;
alter table attendance enable row level security;

-- Perfis: o próprio usuário, colegas de equipe e admin
create policy profiles_select on profiles for select using (
  id = auth.uid()
  or is_platform_admin()
  or exists (
    select 1 from team_members me
    join team_members other on other.team_id = me.team_id
    where me.user_id = auth.uid() and other.user_id = profiles.id
  )
);
-- is_platform_admin não pode ser alterado pelo próprio usuário (ver trigger abaixo)
create policy profiles_update on profiles for update using (id = auth.uid() or is_platform_admin());

create or replace function protect_admin_flag() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() nulo = SQL editor ou service role, onde o primeiro admin é definido
  if new.is_platform_admin is distinct from old.is_platform_admin
     and auth.uid() is not null and not is_platform_admin() then
    raise exception 'forbidden';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_admin_flag
  before update on profiles
  for each row execute function protect_admin_flag();

-- Planos: leitura pública, escrita só admin
create policy plans_select on plans for select using (true);
create policy plans_admin_write on plans for all using (is_platform_admin()) with check (is_platform_admin());

-- Assinaturas e pagamentos: dono lê, admin faz tudo. Alterações de cobrança vêm do webhook (service role).
create policy subscriptions_select on subscriptions for select using (owner_id = auth.uid() or is_platform_admin());
create policy subscriptions_admin_write on subscriptions for all using (is_platform_admin()) with check (is_platform_admin());

create policy payments_select on payments for select using (
  is_platform_admin()
  or exists (select 1 from subscriptions s where s.id = payments.subscription_id and s.owner_id = auth.uid())
);
create policy payments_admin_write on payments for all using (is_platform_admin()) with check (is_platform_admin());

create policy audit_admin on admin_audit_log for all using (is_platform_admin()) with check (is_platform_admin());

-- Equipe: membros leem, comissão edita
create policy teams_select on teams for select using (is_team_member(id) or is_platform_admin());
create policy teams_insert on teams for insert with check (owner_id = auth.uid());
create policy teams_update on teams for update using (owner_id = auth.uid());
create policy teams_delete on teams for delete using (owner_id = auth.uid());

create policy team_members_select on team_members for select using (is_team_member(team_id) or is_platform_admin());
create policy team_members_write on team_members for all using (
  exists (select 1 from teams t where t.id = team_members.team_id and t.owner_id = auth.uid())
) with check (
  exists (select 1 from teams t where t.id = team_members.team_id and t.owner_id = auth.uid())
);

create policy athletes_select on athletes for select using (is_team_member(team_id) or is_platform_admin());
create policy athletes_write on athletes for all using (is_team_staff(team_id)) with check (is_team_staff(team_id));

create policy events_select on events for select using (is_team_member(team_id) or is_platform_admin());
create policy events_write on events for all using (is_team_staff(team_id)) with check (is_team_staff(team_id));

create policy attendance_select on attendance for select using (
  exists (select 1 from events e where e.id = attendance.event_id and (is_team_member(e.team_id) or is_platform_admin()))
);
create policy attendance_staff_write on attendance for all using (
  exists (select 1 from events e where e.id = attendance.event_id and is_team_staff(e.team_id))
) with check (
  exists (select 1 from events e where e.id = attendance.event_id and is_team_staff(e.team_id))
);
-- Atleta confirma a própria presença
create policy attendance_athlete_rsvp on attendance for update using (
  exists (select 1 from athletes a where a.id = attendance.athlete_id and a.user_id = auth.uid())
);
