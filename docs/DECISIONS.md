# ResolveX Architecture & Requirements Decisions Register

This document records all architectural choices, issue readings, and assumptions for ResolveX (College Complaint Management System - CCMS).
Per project rules:
1. When PRD and SRS disagree, the PRD is authoritative and the conflict is logged here.
2. For known SRS issues (ISS-01 to ISS-16), the working reading specified in the project charter is implemented and logged here as an assumption awaiting stakeholder ratification.
3. Open questions from PRD 16.5 / SRS 15.4 (OQ-01 to OQ-21) are assigned explicit, safe default values that are runtime-configurable via database settings (`system_settings`) where applicable.

---

## 1. Known SRS Issues Working Readings (ISS-01 to ISS-16)

| Issue ID | Problem & Context | Working Reading Implemented | Rationale & Code Impact | Status |
|---|---|---|---|---|
| **ISS-01** | PRD diagram 3.6.1 restricts `CLOSED` -> `REOPENED` to auto-closed only within window, whereas TR-10 and BR-10 allow Manager / Admin to reopen any resolved/closed complaint. | **TR-10 is authoritative.** Managers and Admins can reopen any `RESOLVED` or `CLOSED` complaint with an audit note. Reporters can only reopen within the confirmation window per BR-10. | Reopening by managers is an operational necessity when unexpected failure recurs. Handled in `WorkflowService.reopen()`. | Approved Default |
| **ISS-02** | Permission matrix in PRD 2.3 only assigns hold/resume to Manager and Admin, while TR-07 allows the Assignee to resume an `ON_HOLD` complaint. | Add `complaint.resume` permission granted to Assignee, Manager, and Admin. | Staff members must be able to restart work once parts or access arrive without waiting for manager intervention. | Approved Default |
| **ISS-03** | ESC-04 escalation scan fires when unresolved, but PRD 8.4 index covers only `ASSIGNED`, `IN_PROGRESS`, `REOPENED`. `SUBMITTED` or `UNDER_REVIEW` complaints could be missed. | Include `SUBMITTED` and `UNDER_REVIEW` in the resolution-overdue scan query and partial index. | Prevents unassigned complaints from silently breaching resolution SLAs without escalation. | Approved Default |
| **ISS-04** | ESC-02 escalation triggers on missed acknowledgement by 100% of target, but schema only has `ack_due_at`. | Store `ack_level2_due_at` explicitly on complaint row upon submission. | Avoids inconsistent recomputation when category SLA policies are updated after complaint submission. | Approved Default |
| **ISS-05** | TR-04 allows reassignment from `ON_HOLD` to `ASSIGNED`, but schema pause behavior was unspecified. | Reassignment from `ON_HOLD` resumes the SLA clock and extends due times by the total paused duration. | Preserves integrity of SLA timers and fair calculation of assignee resolution targets. | Approved Default |
| **ISS-06** | BR-13 and FR-041 refer to 'absent' staff, but user schema only models active/inactive. | FR-041 covers deactivated (`is_active = false`) staff only; temporary absence flag deferred to v2. | Aligns with schema without inventing unspecced calendar/leave management modules. | Approved Default |
| **ISS-07** | Ambiguity when both the reopen window has expired and the maximum reopen count is reached. | Apply the **reopen-window check first**, then the dispute rule. If window expired, return `409 REOPEN_WINDOW_EXPIRED`. | A dispute is only meaningful within an active post-resolution window. | Approved Default |
| **ISS-08** | Confirmation reminder was hardcoded to day 5, but auto-close window (CFG-08) is configurable (default 7 days). | Reminder fires `CFG-18` days (default 2 days) before auto-closure date. | If auto-close window is adjusted to 3 days, reminder still fires on day 1 instead of missing entirely. | Approved Default |
| **ISS-09** | Start time for working-hours SLA clocks submitted during weekends or off-hours. | Clock starts at the **next opening of working hours** (e.g., next business day at 09:00). | Matches realistic facility management service expectations. Urgent/Safety uses 24x7 clock. | Approved Default |
| **ISS-10** | Conflict error code discrepancy: US-11 AC3 uses `409 CONFLICT`, but API 9.2, EC-13, and TC-W03 specify `409 VERSION_CONFLICT`. | Use `VERSION_CONFLICT` consistently everywhere for optimistic concurrency conflicts. | Uniform error structure across all endpoints. | Approved Default |
| **ISS-11** | Interaction between confirmation rating and post-close feedback endpoint (DR-09). | `POST /complaints/{id}/feedback` is allowed **only when no feedback exists** for that resolution cycle and status is `CLOSED` or `REOPENED`. | Enforces one feedback per resolution cycle without duplicate conflicts. | Approved Default |
| **ISS-12** | Holiday calendar (CFG-22) defaults to empty, which would treat holidays as business days. | Provide CFG-22 holiday settings in database. Display a prominent **Go-Live Checklist Warning** if holiday calendar is empty. | Prevents erroneous SLA breaches on official campus closures while permitting initial testing. | Approved Default |
| **ISS-13** | PRD R-14 requires managers to hide inappropriate attachments, but API catalogue lacked an endpoint. | Implement proposed endpoint **API-P01**: `POST /complaints/{id}/attachments/{attId}/hide` (audited, manager/admin only). | Crucial privacy and moderation control. | Approved Default |
| **ISS-14** | Manager queues require filtering by unrouted, inactive assignee, acknowledgement overdue, and long hold. | Implement proposed query filters **API-P02**: `?filter=unrouted|assigneeInactive|ackOverdue|longHold` on complaint list. Bulk reassignment **API-P03** coupled with FR-041. | Enables specialized triage queues required by UIR-018. | Approved Default |
| **ISS-15** | Ambiguity regarding withdrawal (TR-13, FR-032). | **Withdrawal is in MVP scope** (student may withdraw while `SUBMITTED` or `UNDER_REVIEW`). | Implements TR-13 cleanly with audit trail. | Approved Default |
| **ISS-16** | Access code for former assignees after reassignment. | Former assignee loses access immediately and receives **`404 NOT_FOUND`** (BR-20 scoping rules). | Information barrier ensures staff only see active work assigned to their department/person. | Approved Default |

---

## 2. Proposed Functional Additions (PFR-01 to PFR-04)

- **PFR-01 (Allowed-Domain Admin):** Administrators can manage institutional email domain allowlist (`system_settings.allowed_email_domains`).
- **PFR-02 (Department Admin):** Full CRUD for departments, manager assignment, and active status.
- **PFR-03 (Health Endpoint):** `GET /api/v1/health` providing readiness, database connectivity, storage status, and worker heartbeats.
- **PFR-04 (Scheduled Cleanup Worker):** Worker cron jobs for expired tokens (7 days), old notifications (180 days), and orphaned temporary upload objects (24 hours).

---

## 3. Open Questions (PRD 16.5 / SRS 15.4) Default Implementations

| ID | Description | Default Decision Implemented | Configuration Key |
|---|---|---|---|
| **OQ-01** | Institutional email domains & SSO | Allowlist in `system_settings` defaulting to `@college.edu` and `@student.college.edu`. SSO deferred to v2. | `allowed_email_domains` (CFG-04) |
| **OQ-02** | Working hours & calendar | Mon-Fri 09:00 - 17:00 (8 hours/day). Urgent/Safety tickets use 24x7 calendar. | `working_hours_start`, `working_hours_end`, `working_days` (CFG-01, CFG-02) |
| **OQ-03** | SLA Targets | Seed defaults per PRD 3.8.2: Emergency (ack 1h / res 4h), Urgent (ack 2h / res 24h), Normal (ack 8h / res 72h), Low (ack 24h / res 168h). | `sla_policies` table |
| **OQ-04** | Departments | Seed initial 6 departments: Hostel Maintenance, Electrical Services, Plumbing & Water, IT & AV Systems, Campus Infrastructure, Sanitation & Housekeeping. | `departments` table |
| **OQ-05** | Campus Locations | Hierarchical locations seeded: Academic Blocks A-C, Hostels H1-H4, Central Library, Student Cafeteria, Sports Complex, Engineering Labs. | `locations` table |
| **OQ-06** | Unrouted Queue Triage | Facility Managers triage and assign department to unrouted tickets. | `CFG-13: unrouted_triage_role = 'FACILITY_MANAGER'` |
| **OQ-07** | Staff View of Reporter Identity | Hidden by default (`CFG-14: staff_can_view_reporter_name = false`). Staff sees ticket details and location, not student name. | `staff_can_view_reporter_name` (CFG-14) |
| **OQ-08** | Safety Hazard & Emergency Protocols | Emergency hotline displayed prominently on form; safety flag sends immediate manager notifications and tags ticket as High/Emergency. | `emergency_contact_phone`, `emergency_disclaimer_text` (CFG-16) |
| **OQ-09** | Data Retention & Consent | Data retained 365 days post-closure. Mandatory consent checkbox on registration. | `complaint_retention_days` (CFG-20) |
| **OQ-10** | Hosting & Environment | Single-host or containerized architecture; Docker Compose deployment blueprint with Caddy/Nginx reverse proxy. | System Architecture |
| **OQ-11** | Email Provider | Standard SMTP provider interface. In development, connects to Mailpit container. | `SMTP_*` environment variables |
| **OQ-12** | Abuse Prevention | Rate limiting per IP and per user; ability for Administrators to deactivate accounts. | `rate_limits` & `is_active` |
| **OQ-13** | Reopen & Confirmation Windows | Confirmation auto-close window: 7 days (`CFG-08`). Reopen window: 3 days (`CFG-09`). Max reopenings before dispute: 2 (`CFG-10`). | `CFG-08`, `CFG-09`, `CFG-10` |
| **OQ-14** | Dispute Resolution | Escalated disputes (`is_disputed = true`) are resolved exclusively by Administrators. | Role Permission: `complaint.decide_dispute` |
| **OQ-15** | External Contractors | Excluded from MVP; assigned exclusively to college department maintenance staff. | Scope Boundary |
| **OQ-16** | Location Management | Maintained by Facility Managers and Administrators via management console. | Role Permission: `location.manage` |
| **OQ-17** | Staff Usability & Devices | Mobile-first Web UI responsive down to 360px viewport; minimum 44px touch targets; 3-tap action flow for staff. | Front-end Design System |
| **OQ-18** | Pilot Scope | Single pilot campus/hostel configuration seeded in local development. | Seed Data |
| **OQ-19** | Student Council Read-Only Reports | Deferred to Version 2. | Scope Boundary |
| **OQ-20** | Staff Performance Metrics | Visible to Managers and Administrators. Individual staff see only their assigned workload. | Role Serializer Scoping |
| **OQ-21** | Branding & Color Palette | ResolveX brand tokens derived from official logo: Navy `#0B1F4B`, Blue `#0A5CD6`, Sky `#0AA0FF`, Green-Teal `#10C98A`. | Design Tokens (`index.css`) |

---

## 4. Key Architectural Decisions

1. **Monorepo Structure:**
   - `apps/api`: NestJS REST API with OpenAPI generator, auth, workflow engine, SLA calculator.
   - `apps/worker`: NestJS background worker using pg-boss for SLA scans, auto-close, escalation, and email outbox delivery.
   - `apps/web`: Vite + React + TypeScript + Tailwind CSS with WCAG 2.2 AA accessible design system.
   - `packages/shared`: Shared TypeScript types, enums (Role, Status, Priority), DTO validation schemas (Zod).
   - `db/migrations`: Plain SQL migrations executed by a migration runner.
2. **Database Roles & Append-Only Audit:**
   - `resolvex_owner`: Schema owner role executing migrations.
   - `resolvex_app`: Application runtime role with `SELECT`, `INSERT`, `UPDATE`, `DELETE` on regular entities, but **strictly `SELECT` and `INSERT` only** on `audit_logs` and `status_history`.
3. **Optimistic Concurrency:**
   - Every complaint record has an integer `version` incremented on status change or update. Concurrent updates return `409 VERSION_CONFLICT`.

---

## 5. Multi-Organization Architecture & Tenant Isolation (Architectural Enhancement)

To enable ResolveX to scale across Colleges, Hospitals, Municipalities, and Corporate Workplaces while preserving strict data segregation:

1. **`organizations` Entity:**
   - Schema: `id` (UUID), `slug` (varchar, unique), `name` (varchar), `type` (`COLLEGE`, `HOSPITAL`, `MUNICIPALITY`, `CORPORATE`), `is_active` (boolean), `created_at`, `updated_at`.
   - Default Seed Tenant: Single organization seeded for MVP (`slug = 'campusfix-college'`, `name = 'ResolveX University'`, `type = 'COLLEGE'`).
2. **Tenant Scoping Across Entities:**
   - The following tables carry foreign key `organization_id REFERENCES organizations(id) ON DELETE RESTRICT`:
     - `users`
     - `departments`
     - `locations`
     - `categories`
     - `complaints`
     - `sla_policies`
     - `system_settings`
     - `audit_logs`
3. **Strict Cross-Tenant Isolation Enforcement:**
   - **Repository Level:** Every data access query in NestJS repositories strictly injects `WHERE organization_id = :currentUserOrgId`.
   - **Entity Access:** Any attempt to fetch or modify a record belonging to another organization returns **`404 NOT_FOUND`** (never revealing the existence of other tenants' records).
   - **File Storage:** S3 keys / disk storage paths are prefixed by organization slug: `tenants/{orgId}/complaints/{complaintId}/{hash}.webp`.
   - **Automated Verification (`TC-TENANT01`):** Integration tests explicitly assert that users in Org A cannot query, view, update, comment on, or download attachments of complaints belonging to Org B.
4. **Configurable Workflows per Organization:**
   - SLA targets, working hours, auto-close windows, and departments are configured per `organization_id` in `system_settings` and `sla_policies`.
   - Safety hazard / emergency protocols remain non-bypassable regardless of tenant type.

