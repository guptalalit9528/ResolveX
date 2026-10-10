-- Migration: 004_db_roles_and_permissions.sql
-- Description: Dual database security roles configuration (resolvex_owner vs resolvex_app)

DO $$
BEGIN
    -- 1. Create Migration Owner Role if not exists
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'resolvex_owner') THEN
        CREATE ROLE resolvex_owner WITH LOGIN PASSWORD 'owner_secure_pass';
    END IF;

    -- 2. Create Application Runtime Role if not exists
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'resolvex_app') THEN
        CREATE ROLE resolvex_app WITH LOGIN PASSWORD 'app_secure_pass';
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        -- In environments where role creation requires superuser (e.g. AWS RDS or non-superuser test runners)
        RAISE NOTICE 'Skipping CREATE ROLE due to lack of superuser privileges.';
END
$$;

-- Grant owner full privileges on all tables & sequences
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'resolvex_owner') THEN
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO resolvex_owner;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO resolvex_owner;
    END IF;
END
$$;

-- Configure Application Runtime Role (resolvex_app)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'resolvex_app') THEN
        -- Grant standard operational privileges
        GRANT SELECT, INSERT, UPDATE, DELETE ON 
            organizations, users, departments, locations, categories, 
            complaints, comments, attachments, feedback, sessions, 
            sla_policies, system_settings, notification_outbox 
        TO resolvex_app;

        -- Grant sequence usage
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO resolvex_app;

        -- Strictly grant SELECT and INSERT ONLY on append-only audit & history tables
        GRANT SELECT, INSERT ON audit_logs, status_history TO resolvex_app;

        -- Explicitly revoke modification and truncation privileges
        REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs, status_history FROM resolvex_app;
    END IF;
END
$$;
