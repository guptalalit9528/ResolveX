-- Initialize database roles for ResolveX
-- 1. Owner role used for running migrations and DDL
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'resolvex_owner') THEN
    CREATE ROLE resolvex_owner WITH LOGIN PASSWORD 'owner_secure_pass';
  END IF;
END
$$;

-- 2. Application runtime role used by API/Worker
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'resolvex_app') THEN
    CREATE ROLE resolvex_app WITH LOGIN PASSWORD 'app_secure_pass';
  END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE resolvex_db TO resolvex_owner;
GRANT CONNECT ON DATABASE resolvex_db TO resolvex_app;
