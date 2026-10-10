-- Migration: 002_complaints_schema.sql
-- Description: Complaints, attachments, comments, feedback, constraints, and indexes

-- Sequence for human-readable complaint identifier: CCMS-YYYY-NNNNNN
CREATE SEQUENCE complaint_seq START WITH 1 INCREMENT BY 1;

-- 1. Complaints Table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    complaint_number VARCHAR(32) NOT NULL,
    client_request_id UUID NOT NULL,
    reporter_id UUID NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL,
    department_id UUID,
    location_id UUID NOT NULL,
    location_details VARCHAR(250),
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    priority VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
    is_provisional_priority BOOLEAN NOT NULL DEFAULT TRUE,
    is_safety_hazard BOOLEAN NOT NULL DEFAULT FALSE,
    is_disputed BOOLEAN NOT NULL DEFAULT FALSE,
    assignee_id UUID,
    version INT NOT NULL DEFAULT 1,
    close_reason VARCHAR(32),
    hold_reason VARCHAR(32),
    reopen_count INT NOT NULL DEFAULT 0,
    sla_paused_at TIMESTAMPTZ,
    total_paused_duration_ms BIGINT NOT NULL DEFAULT 0,
    ack_due_at TIMESTAMPTZ,
    ack_level2_due_at TIMESTAMPTZ, -- Stored explicitly at submission for ESC-02 (per ISS-04)
    resolve_due_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Multi-tenant Unique Constraints
    CONSTRAINT uq_complaint_org_number UNIQUE (organization_id, complaint_number),
    CONSTRAINT uq_complaint_org_idempotency UNIQUE (organization_id, reporter_id, client_request_id),
    CONSTRAINT uq_complaint_org_id UNIQUE (organization_id, id),

    -- Strict Tenant-Scoped Composite Foreign Keys (Zero Cross-Tenant Contamination)
    CONSTRAINT fk_complaint_reporter FOREIGN KEY (organization_id, reporter_id) REFERENCES users(organization_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_cat FOREIGN KEY (organization_id, category_id) REFERENCES categories(organization_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_dept FOREIGN KEY (organization_id, department_id) REFERENCES departments(organization_id, id) ON DELETE SET NULL,
    CONSTRAINT fk_complaint_loc FOREIGN KEY (organization_id, location_id) REFERENCES locations(organization_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_assignee FOREIGN KEY (organization_id, assignee_id) REFERENCES users(organization_id, id) ON DELETE SET NULL,

    -- Data Requirements & Check Constraints (DR-14)
    CONSTRAINT chk_complaint_title_len CHECK (char_length(title) >= 5 AND char_length(title) <= 120),
    CONSTRAINT chk_complaint_desc_len CHECK (char_length(description) >= 15 AND char_length(description) <= 3000),
    CONSTRAINT chk_complaint_reopen_count CHECK (reopen_count >= 0),
    CONSTRAINT chk_complaint_version CHECK (version >= 1),
    CONSTRAINT chk_complaint_status CHECK (status IN (
        'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 
        'ON_HOLD', 'RESOLVED', 'CLOSED', 'REOPENED', 'REJECTED', 'WITHDRAWN'
    )),
    CONSTRAINT chk_complaint_priority CHECK (priority IN ('LOW', 'NORMAL', 'URGENT', 'EMERGENCY')),
    CONSTRAINT chk_complaint_close_reason CHECK (close_reason IS NULL OR close_reason IN (
        'CONFIRMED', 'AUTO_CLOSED', 'ADMIN_CLOSED', 'DISPUTE_UPHELD', 
        'DISPUTE_OVERRULED', 'WITHDRAWN', 'REJECTED'
    )),
    CONSTRAINT chk_complaint_hold_reason CHECK (hold_reason IS NULL OR hold_reason IN (
        'AWAITING_PARTS', 'ACCESS_UNAVAILABLE', 'THIRD_PARTY_CONTRACTOR', 'WEATHER_PERMITTING', 'OTHER'
    )),

    -- State Invariant Checks (DR-14)
    CONSTRAINT chk_hold_requires_reason_and_pause CHECK (
        (status != 'ON_HOLD') OR (hold_reason IS NOT NULL AND sla_paused_at IS NOT NULL)
    ),
    CONSTRAINT chk_resolved_requires_timestamp CHECK (
        (status != 'RESOLVED') OR (resolved_at IS NOT NULL)
    ),
    CONSTRAINT chk_closed_requires_timestamp_and_reason CHECK (
        (status != 'CLOSED') OR (closed_at IS NOT NULL AND close_reason IS NOT NULL)
    ),
    CONSTRAINT chk_active_requires_assignment CHECK (
        (status NOT IN ('ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED')) OR (assignee_id IS NOT NULL AND department_id IS NOT NULL)
    )
);

-- 2. Attachments
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    complaint_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    size_bytes BIGINT NOT NULL,
    width INT,
    height INT,
    thumbnail_key VARCHAR(512),
    is_resolution_photo BOOLEAN NOT NULL DEFAULT FALSE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE, -- Per ISS-13 / API-P01
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_attachment_complaint FOREIGN KEY (organization_id, complaint_id) REFERENCES complaints(organization_id, id) ON DELETE CASCADE,
    CONSTRAINT chk_attachment_size CHECK (size_bytes > 0 AND size_bytes <= 5242880) -- 5MB limit
);

-- 3. Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    complaint_id UUID NOT NULL,
    author_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE, -- Internal staff notes hidden from student
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_comment_complaint FOREIGN KEY (organization_id, complaint_id) REFERENCES complaints(organization_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (organization_id, author_id) REFERENCES users(organization_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_comment_len CHECK (char_length(content) >= 2 AND char_length(content) <= 2000)
);

-- 4. Resolution Feedback (DR-09: One feedback per resolution cycle)
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    complaint_id UUID NOT NULL,
    rating INT NOT NULL,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_feedback_complaint UNIQUE (organization_id, complaint_id),
    CONSTRAINT fk_feedback_complaint FOREIGN KEY (organization_id, complaint_id) REFERENCES complaints(organization_id, id) ON DELETE CASCADE,
    CONSTRAINT chk_feedback_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Indexes for Fast Querying and Escalation Sweeps

-- Full-text GIN search index
CREATE INDEX idx_complaints_search ON complaints USING gin(
    to_tsvector('simple', title || ' ' || description)
);

-- Organization + Status listing index
CREATE INDEX idx_complaints_org_status ON complaints (organization_id, status, created_at DESC);

-- Assignee workload index
CREATE INDEX idx_complaints_assignee ON complaints (organization_id, assignee_id, status)
WHERE status IN ('ASSIGNED', 'IN_PROGRESS', 'ON_HOLD');

-- SLA Resolution Overdue scan index (Includes SUBMITTED and UNDER_REVIEW per ISS-03)
CREATE INDEX idx_complaints_res_overdue ON complaints (organization_id, resolve_due_at)
WHERE status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED', 'ON_HOLD', 'WITHDRAWN');

-- SLA Acknowledgment Overdue scan index (ESC-01, ESC-02)
CREATE INDEX idx_complaints_ack_overdue ON complaints (organization_id, ack_due_at)
WHERE status IN ('SUBMITTED', 'UNDER_REVIEW') AND acknowledged_at IS NULL;
