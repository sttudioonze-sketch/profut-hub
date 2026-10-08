#!/usr/bin/env bash
# Aplica a migração num Postgres local (com um stub do schema auth do Supabase) e roda o smoke test.
# Uso: scripts/test-db.sh   (precisa de psql e um Postgres local; usa o banco profut_test)
set -euo pipefail
cd "$(dirname "$0")/.."
DB=${DB:-profut_test}
psql -q -c "drop database if exists $DB" -c "create database $DB"
psql -q -c "drop role if exists authenticated" || true
psql -v ON_ERROR_STOP=1 -q -d "$DB" \
  -f supabase/tests/auth-stub.sql \
  -f supabase/migrations/*_init.sql \
  -f supabase/tests/smoke.sql
echo "OK"
