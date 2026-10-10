import { ComplaintStatus, Role } from './enums';

export interface TransitionRule {
  id: string; // TR-01 to TR-14
  from: ComplaintStatus | ComplaintStatus[];
  to: ComplaintStatus;
  allowedRoles: Role[];
  description: string;
}

export const TRANSITION_RULES: TransitionRule[] = [
  {
    id: 'TR-01',
    from: ComplaintStatus.SUBMITTED,
    to: ComplaintStatus.UNDER_REVIEW,
    allowedRoles: [Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Manager reviews submitted complaint',
  },
  {
    id: 'TR-02',
    from: ComplaintStatus.SUBMITTED,
    to: ComplaintStatus.ASSIGNED,
    allowedRoles: [Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Direct assignment from submitted',
  },
  {
    id: 'TR-03',
    from: ComplaintStatus.UNDER_REVIEW,
    to: ComplaintStatus.ASSIGNED,
    allowedRoles: [Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Assignment after review',
  },
  {
    id: 'TR-04',
    from: [ComplaintStatus.ASSIGNED, ComplaintStatus.ON_HOLD],
    to: ComplaintStatus.ASSIGNED,
    allowedRoles: [Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Reassignment to another staff member',
  },
  {
    id: 'TR-05',
    from: ComplaintStatus.ASSIGNED,
    to: ComplaintStatus.IN_PROGRESS,
    allowedRoles: [Role.STAFF, Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Staff starts working on complaint',
  },
  {
    id: 'TR-06',
    from: ComplaintStatus.IN_PROGRESS,
    to: ComplaintStatus.ON_HOLD,
    allowedRoles: [Role.STAFF, Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Complaint placed on hold (awaiting parts, access, etc.)',
  },
  {
    id: 'TR-07',
    from: ComplaintStatus.ON_HOLD,
    to: ComplaintStatus.IN_PROGRESS,
    allowedRoles: [Role.STAFF, Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Work resumed from hold (per ISS-02)',
  },
  {
    id: 'TR-08',
    from: ComplaintStatus.IN_PROGRESS,
    to: ComplaintStatus.RESOLVED,
    allowedRoles: [Role.STAFF, Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Work completed and marked resolved with resolution notes/photo',
  },
  {
    id: 'TR-09',
    from: ComplaintStatus.RESOLVED,
    to: ComplaintStatus.CLOSED,
    allowedRoles: [Role.STUDENT, Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Confirmation by student, auto-closure, or admin closure',
  },
  {
    id: 'TR-10',
    from: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED],
    to: ComplaintStatus.REOPENED,
    allowedRoles: [Role.STUDENT, Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Reopened by student within window, or by manager/admin at any time (per ISS-01)',
  },
  {
    id: 'TR-11',
    from: ComplaintStatus.REOPENED,
    to: ComplaintStatus.ASSIGNED,
    allowedRoles: [Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Reassignment of reopened complaint',
  },
  {
    id: 'TR-12',
    from: [ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW],
    to: ComplaintStatus.REJECTED,
    allowedRoles: [Role.FACILITY_MANAGER, Role.ADMINISTRATOR],
    description: 'Rejection of invalid or out-of-scope complaint',
  },
  {
    id: 'TR-13',
    from: [ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW],
    to: ComplaintStatus.WITHDRAWN,
    allowedRoles: [Role.STUDENT],
    description: 'Withdrawal by original reporter before assignment (per ISS-15)',
  },
  {
    id: 'TR-14',
    from: ComplaintStatus.REOPENED,
    to: ComplaintStatus.CLOSED,
    allowedRoles: [Role.ADMINISTRATOR],
    description: 'Administrator adjudicates dispute (upheld or overruled)',
  },
];

export function findMatchingTransition(
  from: ComplaintStatus,
  to: ComplaintStatus,
  role: Role,
): TransitionRule | undefined {
  return TRANSITION_RULES.find((rule) => {
    const fromMatches = Array.isArray(rule.from) ? rule.from.includes(from) : rule.from === from;
    const toMatches = rule.to === to;
    const roleMatches = rule.allowedRoles.includes(role);
    return fromMatches && toMatches && roleMatches;
  });
}

export function isAllowedTransition(from: ComplaintStatus, to: ComplaintStatus, role: Role): boolean {
  return !!findMatchingTransition(from, to, role);
}
