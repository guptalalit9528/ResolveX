-- Migration: 005_seed_data.sql
-- Description: Seed ResolveX University tenant, departments, locations, categories (PRD 3.5.1), SLA policies (PRD 3.8.2), CFG-01..22, and demo users

-- 1. Seed Initial Tenant: ResolveX University (COLLEGE)
INSERT INTO organizations (id, slug, name, type, is_active, settings)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'campusfix-college',
    'ResolveX University',
    'COLLEGE',
    true,
    '{"timezone": "Asia/Kolkata", "theme": "default"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Seed Departments
INSERT INTO departments (id, organization_id, code, name, description, is_active)
VALUES 
    ('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-111111111111', 'HOSTEL', 'Hostel Maintenance', 'Living quarters, rooms, and hostel block facilities', true),
    ('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-111111111111', 'ELECTRICAL', 'Electrical Services', 'Power supply, wiring, fans, lights, switches, and backup generators', true),
    ('22222222-2222-2222-2222-000000000003', '11111111-1111-1111-1111-111111111111', 'PLUMBING', 'Plumbing & Water Supply', 'Water supply, taps, leakage, restrooms, wash basins, and drainage', true),
    ('22222222-2222-2222-2222-000000000004', '11111111-1111-1111-1111-111111111111', 'IT_AV', 'IT & AV Systems', 'Campus Wi-Fi, LAN points, projector systems, and lab workstations', true),
    ('22222222-2222-2222-2222-000000000005', '11111111-1111-1111-1111-111111111111', 'INFRA', 'Campus Infrastructure', 'Civil repairs, doors, locks, windows, desks, and general fixtures', true),
    ('22222222-2222-2222-2222-000000000006', '11111111-1111-1111-1111-111111111111', 'SANITATION', 'Sanitation & Housekeeping', 'Cleanliness, waste collection, washroom sanitization, and pest control', true)
ON CONFLICT (organization_id, code) DO NOTHING;

-- 3. Seed Campus Locations
INSERT INTO locations (id, organization_id, code, name, is_active)
VALUES
    ('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', 'BLOCK_A', 'Academic Block A (Engineering)', true),
    ('33333333-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111111', 'BLOCK_B', 'Academic Block B (Sciences)', true),
    ('33333333-3333-3333-3333-000000000003', '11111111-1111-1111-1111-111111111111', 'BLOCK_C', 'Academic Block C (Management & Humanities)', true),
    ('33333333-3333-3333-3333-000000000004', '11111111-1111-1111-1111-111111111111', 'HOSTEL_H1', 'Boys Hostel H1', true),
    ('33333333-3333-3333-3333-000000000005', '11111111-1111-1111-1111-111111111111', 'HOSTEL_H2', 'Girls Hostel H2', true),
    ('33333333-3333-3333-3333-000000000006', '11111111-1111-1111-1111-111111111111', 'LIBRARY', 'Central Library & Reading Hall', true),
    ('33333333-3333-3333-3333-000000000007', '11111111-1111-1111-1111-111111111111', 'CAFETERIA', 'Student Dining Hall & Cafeteria', true),
    ('33333333-3333-3333-3333-000000000008', '11111111-1111-1111-1111-111111111111', 'SPORTS', 'Sports Complex & Gymnasium', true)
ON CONFLICT (organization_id, code) DO NOTHING;

-- 4. Seed Seed Categories per PRD Table 3.5.1
INSERT INTO categories (id, organization_id, code, name, department_id, default_priority, is_active)
VALUES
    ('44444444-4444-4444-4444-000000000001', '11111111-1111-1111-1111-111111111111', 'ELEC', 'Electrical & Power Supply', '22222222-2222-2222-2222-000000000002', 'NORMAL', true),
    ('44444444-4444-4444-4444-000000000002', '11111111-1111-1111-1111-111111111111', 'PLUMB', 'Plumbing & Water Leakage', '22222222-2222-2222-2222-000000000003', 'NORMAL', true),
    ('44444444-4444-4444-4444-000000000003', '11111111-1111-1111-1111-111111111111', 'FURN', 'Furniture & Carpentry', '22222222-2222-2222-2222-000000000005', 'LOW', true),
    ('44444444-4444-4444-4444-000000000004', '11111111-1111-1111-1111-111111111111', 'NETWORK', 'Internet, LAN & Wi-Fi', '22222222-2222-2222-2222-000000000004', 'NORMAL', true),
    ('44444444-4444-4444-4444-000000000005', '11111111-1111-1111-1111-111111111111', 'HVAC', 'Air Conditioning & Ventilation', '22222222-2222-2222-2222-000000000002', 'NORMAL', true),
    ('44444444-4444-4444-4444-000000000006', '11111111-1111-1111-1111-111111111111', 'CLEAN', 'Sanitation, Cleaning & Waste', '22222222-2222-2222-2222-000000000006', 'NORMAL', true),
    ('44444444-4444-4444-4444-000000000007', '11111111-1111-1111-1111-111111111111', 'CIVIL', 'Civil, Masonry & Doors/Windows', '22222222-2222-2222-2222-000000000005', 'LOW', true),
    ('44444444-4444-4444-4444-000000000008', '11111111-1111-1111-1111-111111111111', 'SECURITY', 'Security, Keys & Access Locks', '22222222-2222-2222-2222-000000000005', 'URGENT', true)
ON CONFLICT (organization_id, code) DO NOTHING;

-- 5. Seed SLA Policies per PRD 3.8.2
INSERT INTO sla_policies (id, organization_id, priority, category_id, ack_target_hours, resolve_target_hours, calendar_type)
VALUES
    ('55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111111', 'EMERGENCY', NULL, 1, 4, 'CONTINUOUS_24X7'),
    ('55555555-5555-5555-5555-000000000002', '11111111-1111-1111-1111-111111111111', 'URGENT', NULL, 2, 24, 'CONTINUOUS_24X7'),
    ('55555555-5555-5555-5555-000000000003', '11111111-1111-1111-1111-111111111111', 'NORMAL', NULL, 8, 72, 'WORKING_HOURS'),
    ('55555555-5555-5555-5555-000000000004', '11111111-1111-1111-1111-111111111111', 'LOW', NULL, 24, 168, 'WORKING_HOURS')
ON CONFLICT (organization_id, priority, category_id) DO NOTHING;

-- 6. Seed Configuration Parameters CFG-01 to CFG-22 (Appendix E)
INSERT INTO system_settings (organization_id, key, value, description)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'CFG-01', '"09:00"'::jsonb, 'Working hours start time (HH:mm)'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-02', '"17:00"'::jsonb, 'Working hours end time (HH:mm)'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-03', '["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"]'::jsonb, 'Active working days of week'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-04', '["@college.edu", "@student.college.edu"]'::jsonb, 'Allowed institutional email domain suffixes (OQ-01)'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-05', '5'::jsonb, 'Max failed login attempts before account lockout'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-06', '15'::jsonb, 'Lockout duration in minutes'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-07', '14'::jsonb, 'Session expiration in days'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-08', '7'::jsonb, 'Auto-close window in days after resolution without confirmation'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-09', '3'::jsonb, 'Reopening window in days after auto-closure or resolution'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-10', '2'::jsonb, 'Maximum allowable reopenings before turning into a dispute'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-11', '3'::jsonb, 'Maximum attachments allowed per complaint submission'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-12', '10'::jsonb, 'Maximum complaints a single user may submit per hour'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-13', '"FACILITY_MANAGER"'::jsonb, 'Role responsible for unrouted complaint queue triage'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-14', 'false'::jsonb, 'Whether maintenance staff may view reporter student identity by default (OQ-07)'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-15', '14'::jsonb, 'Long-hold threshold in days (BR-14)'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-16', '"+1-800-555-HELP"'::jsonb, 'Campus emergency hotline number for safety hazard banner (OQ-08)'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-17', '5'::jsonb, 'Pre-signed file URL expiration in minutes'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-18', '2'::jsonb, 'Days before auto-closure to send confirmation reminder (ISS-08)'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-19', '30'::jsonb, 'Client-side notification polling interval in seconds'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-20', '365'::jsonb, 'Data retention days post-closure before purging (OQ-09)'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-21', '40'::jsonb, 'Maximum image size in uncompressed megapixels (SEC-07.2)'),
    ('11111111-1111-1111-1111-111111111111', 'CFG-22', '[]'::jsonb, 'Official institutional holiday calendar dates (ISS-12, OQ-02)')
ON CONFLICT (organization_id, key) DO UPDATE SET value = EXCLUDED.value;

-- 7. Seed Demo Development Accounts
-- Note: Uses a fixed test hash (password 'Password123!') for development/testing only
INSERT INTO users (id, organization_id, email, password_hash, full_name, role, department_id, is_active, is_email_verified)
VALUES
    ('66666666-6666-6666-6666-000000000001', '11111111-1111-1111-1111-111111111111', 'student@student.college.edu', '$argon2id$v=19$m=65536,t=3,p=4$devsalt12345$devhash_placeholder_pwd123', 'Aarav Sharma (Student)', 'STUDENT', NULL, true, true),
    ('66666666-6666-6666-6666-000000000002', '11111111-1111-1111-1111-111111111111', 'staff.electrical@college.edu', '$argon2id$v=19$m=65536,t=3,p=4$devsalt12345$devhash_placeholder_pwd123', 'Ramesh Kumar (Electrician)', 'STAFF', '22222222-2222-2222-2222-000000000002', true, true),
    ('66666666-6666-6666-6666-000000000003', '11111111-1111-1111-1111-111111111111', 'manager.facilities@college.edu', '$argon2id$v=19$m=65536,t=3,p=4$devsalt12345$devhash_placeholder_pwd123', 'Sunita Verma (Facility Manager)', 'FACILITY_MANAGER', NULL, true, true),
    ('66666666-6666-6666-6666-000000000004', '11111111-1111-1111-1111-111111111111', 'admin@college.edu', '$argon2id$v=19$m=65536,t=3,p=4$devsalt12345$devhash_placeholder_pwd123', 'Vikramaditya Rao (Administrator)', 'ADMINISTRATOR', NULL, true, true)
ON CONFLICT (organization_id, email) DO NOTHING;
