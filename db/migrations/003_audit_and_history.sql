-- Migration: 003_audit_and_history.sql
-- Description: Status history, append-only audit logs, notification outbox, and immutability triggers

-- 1. Status History (Immutable audit of workflow transitions)
CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    complaint_id UUID NOT NULL,
    from_status VARCHAR(32),
    to_status VARCHAR(32) NOT NULL,
    changed_by_id UUID NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_sh_complaint FOREIGN KEY (organization_id, complaint_id) REFERENCES complaints(organization_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_sh_user FOREIGN KEY (organization_id, changed_by_id) REFERENCES users(organization_id, id) ON DELETE RESTRICT
);

CREATE INDEX idx_sh_complaint ON status_history (organization_id, complaint_id, created_at ASC);

-- 2. Audit Logs (Tamper-proof append-only activity log)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    performed_by_id UUID,
    details JSONB,
    before_state JSONB,
    after_state JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_audit_user FOREIGN KEY (organization_id, performed_by_id) REFERENCES users(organization_id, id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_entity ON audit_logs (organization_id, entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_created ON audit_logs (organization_id, created_at DESC);

-- 3. Notification Outbox (Transactional Outbox Pattern for reliable email/in-app delivery)
CREATE TABLE notification_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    complaint_id UUID,
    channel VARCHAR(32) NOT NULL, -- 'EMAIL', 'IN_APP'
    recipient_email VARCHAR(255),
    recipient_user_id UUID,
    event_type VARCHAR(64) NOT NULL,
    subject VARCHAR(255),
    payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    retry_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbox_pending ON notification_outbox (status, next_retry_at)
WHERE status IN ('PENDING', 'FAILED');

-- 4. Database-level Immutability Trigger (Guarantees Append-Only Audit Integrity)
CREATE OR REPLACE FUNCTION prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'PERMISSION DENIED: Audit and history records are strictly append-only. Modification or deletion is permanently prohibited.'
        USING ERRCODE = '42501';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_status_history
    BEFORE UPDATE OR DELETE ON status_history
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_tampering();

CREATE TRIGGER trg_protect_audit_logs
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_tampering();
