-- Migration: 001_organizations_and_core.sql
-- Description: Organizations table, core administrative entities, users, sessions, RBAC, and system settings
-- Note: gen_random_uuid() is built natively into PostgreSQL 13+ without extensions

-- 1. Organizations (Multi-Tenancy Root)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'COLLEGE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_org_type CHECK (type IN ('COLLEGE', 'HOSPITAL', 'MUNICIPALITY', 'CORPORATE'))
);

-- 2. Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_dept_org_code UNIQUE (organization_id, code),
    CONSTRAINT uq_dept_org_id UNIQUE (organization_id, id)
);

-- 3. Locations (Hierarchical)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_loc_org_code UNIQUE (organization_id, code),
    CONSTRAINT uq_loc_org_id UNIQUE (organization_id, id),
    CONSTRAINT fk_loc_parent FOREIGN KEY (organization_id, parent_id) REFERENCES locations(organization_id, id) ON DELETE SET NULL
);

-- 4. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(32),
    role VARCHAR(32) NOT NULL,
    department_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_org_email UNIQUE (organization_id, email),
    CONSTRAINT uq_user_org_id UNIQUE (organization_id, id),
    CONSTRAINT chk_user_role CHECK (role IN ('STUDENT', 'STAFF', 'FACILITY_MANAGER', 'ADMINISTRATOR')),
    CONSTRAINT fk_user_dept FOREIGN KEY (organization_id, department_id) REFERENCES departments(organization_id, id) ON DELETE SET NULL
);

-- Add manager FK to departments now that users table exists
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_manager FOREIGN KEY (organization_id, manager_id) REFERENCES users(organization_id, id) ON DELETE SET NULL;

-- 5. Sessions (Server-side hashed session tokens)
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_session_user FOREIGN KEY (organization_id, user_id) REFERENCES users(organization_id, id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_expires ON sessions (expires_at);
CREATE INDEX idx_sessions_user ON sessions (user_id);

-- 6. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL,
    default_priority VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cat_org_code UNIQUE (organization_id, code),
    CONSTRAINT uq_cat_org_id UNIQUE (organization_id, id),
    CONSTRAINT chk_cat_priority CHECK (default_priority IN ('LOW', 'NORMAL', 'URGENT', 'EMERGENCY')),
    CONSTRAINT fk_cat_dept FOREIGN KEY (organization_id, department_id) REFERENCES departments(organization_id, id) ON DELETE RESTRICT
);

-- 7. SLA Policies
CREATE TABLE sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    priority VARCHAR(32) NOT NULL,
    category_id UUID,
    ack_target_hours INT NOT NULL,
    resolve_target_hours INT NOT NULL,
    calendar_type VARCHAR(32) NOT NULL DEFAULT 'WORKING_HOURS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sla_org_prio_cat UNIQUE (organization_id, priority, category_id),
    CONSTRAINT chk_sla_priority CHECK (priority IN ('LOW', 'NORMAL', 'URGENT', 'EMERGENCY')),
    CONSTRAINT chk_sla_calendar CHECK (calendar_type IN ('WORKING_HOURS', 'CONTINUOUS_24X7')),
    CONSTRAINT chk_sla_ack_target CHECK (ack_target_hours > 0),
    CONSTRAINT chk_sla_resolve_target CHECK (resolve_target_hours > 0),
    CONSTRAINT fk_sla_cat FOREIGN KEY (organization_id, category_id) REFERENCES categories(organization_id, id) ON DELETE CASCADE
);

-- 8. System Settings (Per-tenant CFG configuration)
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    key VARCHAR(64) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_settings_org_key UNIQUE (organization_id, key)
);
