import test from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { Migrator } from './migrator';

test('Phase 2 Database Suite: Migrations, Constraints, Multi-Tenancy & Append-Only Audit', async (t) => {
  const db = new PGlite();
  const migrator = new Migrator();

  await t.test('1. Clean database migration run and idempotency', async () => {
    const results = await migrator.run(db);
    assert.equal(results.length, 5, 'Should apply all 5 migrations');
    for (const r of results) {
      assert.equal(r.status, 'APPLIED', `Migration ${r.name} should be APPLIED`);
    }

    // Run again to ensure idempotency
    const secondRun = await migrator.run(db);
    for (const r of secondRun) {
      assert.equal(r.status, 'SKIPPED', `Migration ${r.name} should be SKIPPED on second run`);
    }
  });

  await t.test('2. Seed Data Validation (PRD 3.5.1, PRD 3.8.2, Appendix E)', async () => {
    // Check initial tenant
    const orgRes = await db.query("SELECT * FROM organizations WHERE slug = 'campusfix-college'");
    assert.equal(orgRes.rows.length, 1);
    assert.equal(orgRes.rows[0].name, 'ResolveX University');
    assert.equal(orgRes.rows[0].type, 'COLLEGE');
    const orgId = orgRes.rows[0].id;

    // Check departments
    const deptRes = await db.query('SELECT code FROM departments WHERE organization_id = $1 ORDER BY code', [orgId]);
    const deptCodes = deptRes.rows.map((r: any) => r.code);
    assert.deepEqual(deptCodes.sort(), ['ELECTRICAL', 'HOSTEL', 'INFRA', 'IT_AV', 'PLUMBING', 'SANITATION'].sort());

    // Check locations
    const locRes = await db.query('SELECT count(*) as count FROM locations WHERE organization_id = $1', [orgId]);
    assert.equal(parseInt(locRes.rows[0].count, 10), 8);

    // Check categories
    const catRes = await db.query('SELECT count(*) as count FROM categories WHERE organization_id = $1', [orgId]);
    assert.equal(parseInt(catRes.rows[0].count, 10), 8);

    // Check SLA policies
    const slaRes = await db.query('SELECT count(*) as count FROM sla_policies WHERE organization_id = $1', [orgId]);
    assert.equal(parseInt(slaRes.rows[0].count, 10), 4);

    // Check System Settings CFG-01 to CFG-22
    const cfgRes = await db.query("SELECT count(*) as count FROM system_settings WHERE organization_id = $1 AND key LIKE 'CFG-%'", [orgId]);
    assert.equal(parseInt(cfgRes.rows[0].count, 10), 22);

    // Check demo users
    const usersRes = await db.query('SELECT role, email FROM users WHERE organization_id = $1', [orgId]);
    assert.equal(usersRes.rows.length, 4);
  });

  await t.test('3. DR-14 Constraint Enforcement (Complaints Table)', async () => {
    const orgRes = await db.query("SELECT id FROM organizations WHERE slug = 'campusfix-college'");
    const orgId = orgRes.rows[0].id;

    const userRes = await db.query("SELECT id FROM users WHERE email = 'student@student.college.edu'");
    const reporterId = userRes.rows[0].id;

    const catRes = await db.query("SELECT id FROM categories WHERE code = 'ELEC'");
    const categoryId = catRes.rows[0].id;

    const locRes = await db.query("SELECT id FROM locations WHERE code = 'BLOCK_A'");
    const locationId = locRes.rows[0].id;

    // A. Rejection of title < 5 characters
    await assert.rejects(
      async () => {
        await db.query(`
          INSERT INTO complaints (
            organization_id, complaint_number, client_request_id, reporter_id,
            title, description, category_id, location_id, status
          ) VALUES (
            $1, 'CCMS-2026-000001', gen_random_uuid(), $2,
            'Fan', 'The ceiling fan in room 204 is making loud humming noise.', $3, $4, 'SUBMITTED'
          )
        `, [orgId, reporterId, categoryId, locationId]);
      },
      /chk_complaint_title_len/,
      'Should reject title with less than 5 characters'
    );

    // B. Rejection of description < 15 characters
    await assert.rejects(
      async () => {
        await db.query(`
          INSERT INTO complaints (
            organization_id, complaint_number, client_request_id, reporter_id,
            title, description, category_id, location_id, status
          ) VALUES (
            $1, 'CCMS-2026-000002', gen_random_uuid(), $2,
            'Ceiling Fan Issue', 'Too short desc', $3, $4, 'SUBMITTED'
          )
        `, [orgId, reporterId, categoryId, locationId]);
      },
      /chk_complaint_desc_len/,
      'Should reject description with less than 15 characters'
    );

    // C. Rejection of ON_HOLD without hold_reason or sla_paused_at
    await assert.rejects(
      async () => {
        await db.query(`
          INSERT INTO complaints (
            organization_id, complaint_number, client_request_id, reporter_id,
            title, description, category_id, location_id, status,
            assignee_id, department_id
          ) VALUES (
            $1, 'CCMS-2026-000003', gen_random_uuid(), $2,
            'Ceiling Fan Broken', 'The ceiling fan in room 204 is completely broken and stopped spinning.',
            $3, $4, 'ON_HOLD', $2, (SELECT department_id FROM categories WHERE id = $3)
          )
        `, [orgId, reporterId, categoryId, locationId]);
      },
      /chk_hold_requires_reason_and_pause/,
      'Should reject ON_HOLD complaint missing hold_reason and sla_paused_at'
    );

    // D. Rejection of RESOLVED without resolved_at
    await assert.rejects(
      async () => {
        await db.query(`
          INSERT INTO complaints (
            organization_id, complaint_number, client_request_id, reporter_id,
            title, description, category_id, location_id, status,
            assignee_id, department_id
          ) VALUES (
            $1, 'CCMS-2026-000004', gen_random_uuid(), $2,
            'Ceiling Fan Broken', 'The ceiling fan in room 204 is completely broken and stopped spinning.',
            $3, $4, 'RESOLVED', $2, (SELECT department_id FROM categories WHERE id = $3)
          )
        `, [orgId, reporterId, categoryId, locationId]);
      },
      /chk_resolved_requires_timestamp/,
      'Should reject RESOLVED complaint missing resolved_at'
    );

    // E. Idempotency test (duplicate reporter_id + client_request_id)
    const clientRequestId = 'a0000000-0000-0000-0000-000000000001';
    await db.query(`
      INSERT INTO complaints (
        organization_id, complaint_number, client_request_id, reporter_id,
        title, description, category_id, location_id, status
      ) VALUES (
        $1, 'CCMS-2026-000005', $2, $3,
        'Valid Complaint Submission', 'This is a valid detailed description of the reported campus issue.',
        $4, $5, 'SUBMITTED'
      )
    `, [orgId, clientRequestId, reporterId, categoryId, locationId]);

    await assert.rejects(
      async () => {
        await db.query(`
          INSERT INTO complaints (
            organization_id, complaint_number, client_request_id, reporter_id,
            title, description, category_id, location_id, status
          ) VALUES (
            $1, 'CCMS-2026-000006', $2, $3,
            'Duplicate Submission Attempt', 'This is another complaint with identical clientRequestId.',
            $4, $5, 'SUBMITTED'
          )
        `, [orgId, clientRequestId, reporterId, categoryId, locationId]);
      },
      /uq_complaint_org_idempotency/,
      'Should enforce idempotency per reporter and clientRequestId'
    );
  });

  await t.test('4. Cross-Tenant Isolation Tests (TC-TENANT01)', async () => {
    // Create second organization: City Hospital
    const orgBetaRes = await db.query(`
      INSERT INTO organizations (slug, name, type)
      VALUES ('city-hospital', 'City General Hospital', 'HOSPITAL')
      RETURNING id
    `);
    const orgBetaId = orgBetaRes.rows[0].id;

    // Create user in Org Beta
    const userBetaRes = await db.query(`
      INSERT INTO users (organization_id, email, password_hash, full_name, role)
      VALUES ($1, 'nurse@hospital.org', 'pwdhash', 'Nurse Joy', 'STUDENT')
      RETURNING id
    `, [orgBetaId]);
    const nurseId = userBetaRes.rows[0].id;

    // Retrieve Org Alpha identifiers
    const orgAlphaRes = await db.query("SELECT id FROM organizations WHERE slug = 'campusfix-college'");
    const orgAlphaId = orgAlphaRes.rows[0].id;

    const catAlphaRes = await db.query("SELECT id FROM categories WHERE organization_id = $1 LIMIT 1", [orgAlphaId]);
    const catAlphaId = catAlphaRes.rows[0].id;

    const locAlphaRes = await db.query("SELECT id FROM locations WHERE organization_id = $1 LIMIT 1", [orgAlphaId]);
    const locAlphaId = locAlphaRes.rows[0].id;

    // ATTEMPT CROSS-TENANT POLLUTION:
    // Create complaint in Org Alpha referencing reporter from Org Beta
    await assert.rejects(
      async () => {
        await db.query(`
          INSERT INTO complaints (
            organization_id, complaint_number, client_request_id, reporter_id,
            title, description, category_id, location_id, status
          ) VALUES (
            $1, 'CCMS-2026-000099', gen_random_uuid(), $2,
            'Cross Tenant Breach Attempt', 'Attempting to inject a user from Org Beta into Org Alpha complaint.',
            $3, $4, 'SUBMITTED'
          )
        `, [orgAlphaId, nurseId, catAlphaId, locAlphaId]);
      },
      /fk_complaint_reporter/,
      'Database foreign key must reject cross-tenant reporter reference'
    );
  });

  await t.test('5. Append-Only Audit Log Enforcement (TC-A01)', async () => {
    const orgRes = await db.query("SELECT id FROM organizations WHERE slug = 'campusfix-college'");
    const orgId = orgRes.rows[0].id;

    // Insert an audit log entry
    const insertAudit = await db.query(`
      INSERT INTO audit_logs (organization_id, entity_type, entity_id, action, details)
      VALUES ($1, 'COMPLAINT', gen_random_uuid(), 'CREATED', '{"info":"Initial creation"}'::jsonb)
      RETURNING id
    `, [orgId]);
    const auditId = insertAudit.rows[0].id;

    // ATTEMPT 1: UPDATE audit_logs (Must be rejected)
    await assert.rejects(
      async () => {
        await db.query('UPDATE audit_logs SET action = $1 WHERE id = $2', ['TAMPERED', auditId]);
      },
      /42501|strictly append-only/,
      'Database trigger must reject UPDATE on audit_logs (TC-A01)'
    );

    // ATTEMPT 2: DELETE from audit_logs (Must be rejected)
    await assert.rejects(
      async () => {
        await db.query('DELETE FROM audit_logs WHERE id = $1', [auditId]);
      },
      /42501|strictly append-only/,
      'Database trigger must reject DELETE on audit_logs (TC-A01)'
    );

    // ATTEMPT 3: UPDATE status_history (Must be rejected)
    const userRes = await db.query("SELECT id FROM users LIMIT 1");
    const userId = userRes.rows[0].id;
    const complaintRes = await db.query("SELECT id FROM complaints LIMIT 1");
    const complaintId = complaintRes.rows[0].id;

    const insertSh = await db.query(`
      INSERT INTO status_history (organization_id, complaint_id, from_status, to_status, changed_by_id)
      VALUES ($1, $2, 'SUBMITTED', 'UNDER_REVIEW', $3)
      RETURNING id
    `, [orgId, complaintId, userId]);
    const shId = insertSh.rows[0].id;

    await assert.rejects(
      async () => {
        await db.query('DELETE FROM status_history WHERE id = $1', [shId]);
      },
      /42501|strictly append-only/,
      'Database trigger must reject DELETE on status_history (TC-A01)'
    );
  });
});
