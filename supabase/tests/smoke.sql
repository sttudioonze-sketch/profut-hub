-- Smoke test: cadastro cria teste grátis, RLS isola equipes, métricas só para admin
\set ON_ERROR_STOP 1
grant usage on schema public, auth to authenticated;
grant all on all tables in schema public to authenticated;
grant execute on all functions in schema public, auth to authenticated;
insert into auth.users values ('00000000-0000-0000-0000-000000000001','admin@x.com','{"full_name":"Admin"}');
insert into auth.users values ('00000000-0000-0000-0000-000000000002','coach@x.com','{"full_name":"Coach A"}');
insert into auth.users values ('00000000-0000-0000-0000-000000000003','coach2@x.com','{}');
insert into auth.users values ('00000000-0000-0000-0000-000000000004','atleta@x.com','{"signup_as":"athlete"}');
update profiles set is_platform_admin = true where id = '00000000-0000-0000-0000-000000000001';
select email, (select count(*) from subscriptions s where s.owner_id=p.id) subs from profiles p order by email;
update subscriptions set status='active', plan_id='treinador' where owner_id='00000000-0000-0000-0000-000000000003';
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select count(*) as coach_sees_subs from subscriptions;
insert into teams (owner_id, name) values ('00000000-0000-0000-0000-000000000002','Time A');
select role from team_members;
insert into athletes (team_id, full_name) select id, 'Jogador 1' from teams;
select count(*) athletes_visible from athletes;
do $$ begin perform * from admin_dashboard_metrics(); raise exception 'should fail'; exception when others then if sqlerrm <> 'forbidden' then raise; end if; end $$;
do $$ begin update profiles set is_platform_admin = true where id = auth.uid(); raise exception 'should fail'; exception when others then if sqlerrm <> 'forbidden' then raise; end if; end $$;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
select count(*) coach2_sees_athletes from athletes;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
select * from admin_dashboard_metrics();
select count(*) admin_sees_subs from subscriptions;
