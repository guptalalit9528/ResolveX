import test from 'node:test';
import assert from 'node:assert/strict';
import { ComplaintStatus, Role } from './enums';
import { isAllowedTransition, findMatchingTransition } from './transitions';

test('Transition matrix: TR-01 to TR-14 enforcement', async (t) => {
  await t.test('Manager can review submitted complaint (TR-01)', () => {
    assert.equal(isAllowedTransition(ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, Role.FACILITY_MANAGER), true);
    assert.equal(isAllowedTransition(ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, Role.STUDENT), false);
  });

  await t.test('Staff can start assigned work (TR-05)', () => {
    assert.equal(isAllowedTransition(ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, Role.STAFF), true);
    assert.equal(isAllowedTransition(ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, Role.STUDENT), false);
  });

  await t.test('Staff can resume work from hold per ISS-02 (TR-07)', () => {
    assert.equal(isAllowedTransition(ComplaintStatus.ON_HOLD, ComplaintStatus.IN_PROGRESS, Role.STAFF), true);
  });

  await t.test('Reporter can withdraw only while submitted or under review (TR-13, ISS-15)', () => {
    assert.equal(isAllowedTransition(ComplaintStatus.SUBMITTED, ComplaintStatus.WITHDRAWN, Role.STUDENT), true);
    assert.equal(isAllowedTransition(ComplaintStatus.UNDER_REVIEW, ComplaintStatus.WITHDRAWN, Role.STUDENT), true);
    assert.equal(isAllowedTransition(ComplaintStatus.ASSIGNED, ComplaintStatus.WITHDRAWN, Role.STUDENT), false);
  });

  await t.test('Invalid transition is rejected', () => {
    assert.equal(isAllowedTransition(ComplaintStatus.SUBMITTED, ComplaintStatus.RESOLVED, Role.STAFF), false);
    assert.equal(isAllowedTransition(ComplaintStatus.CLOSED, ComplaintStatus.IN_PROGRESS, Role.STAFF), false);
  });
});
