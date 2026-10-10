import { Role, OrgType, ComplaintStatus, Priority, CloseReason, HoldReason, ActivityAction, ErrorCode } from './enums';

export interface Organization {
  id: string;
  slug: string;
  name: string;
  type: OrgType;
  isActive: boolean;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: Role;
  departmentId?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description?: string | null;
  managerId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  departmentId: string;
  defaultPriority: Priority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  complaintId: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  thumbnailKey?: string;
  signedUrl?: string;
  thumbnailSignedUrl?: string;
  isResolutionPhoto: boolean;
  isHidden: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string; // Internal UUID
  complaintNumber: string; // CCMS-YYYY-NNNNNN
  organizationId: string;
  reporterId: string;
  reporterName?: string; // Masked for staff if CFG-14 is false
  reporterEmail?: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  departmentId?: string | null;
  departmentName?: string | null;
  locationId: string;
  locationName?: string;
  locationDetails?: string | null;
  status: ComplaintStatus;
  priority: Priority;
  isProvisionalPriority: boolean;
  isSafetyHazard: boolean;
  isDisputed: boolean;
  assigneeId?: string | null;
  assigneeName?: string | null;
  version: number; // Optimistic locking
  closeReason?: CloseReason | null;
  holdReason?: HoldReason | null;
  reopenCount: number;
  slaPausedAt?: string | null;
  totalPausedDurationMs: number;
  ackDueAt?: string | null;
  ackLevel2DueAt?: string | null;
  resolveDueAt?: string | null;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  complaintId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  isInternal: boolean; // Hidden from Student reporters
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  complaintId: string;
  fromStatus?: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  changedById: string;
  changedByName: string;
  reason?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  action: ActivityAction;
  performedById?: string | null;
  performedByName?: string | null;
  details?: Record<string, any>;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface Feedback {
  id: string;
  complaintId: string;
  rating: number; // 1 to 5
  comments?: string | null;
  createdAt: string;
}

export interface ApiErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  requestId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
