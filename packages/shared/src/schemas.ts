import { z } from 'zod';
import { Priority, HoldReason } from './enums';

export const LoginSchema = z.object({
  email: z.string().email('Valid email address is required').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z.object({
  organizationSlug: z.string().min(1, 'Organization identifier is required'),
  email: z.string().email('Valid institutional email is required').trim().toLowerCase(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const CreateComplaintSchema = z.object({
  clientRequestId: z.string().uuid('Valid UUID clientRequestId is required for idempotency'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(15, 'Description must be at least 15 characters').max(3000),
  categoryId: z.string().uuid('Valid categoryId is required'),
  locationId: z.string().uuid('Valid locationId is required'),
  locationDetails: z.string().max(250).optional(),
  isSafetyHazard: z.boolean().default(false),
  attachmentIds: z.array(z.string().uuid()).max(3, 'Maximum 3 photos allowed').optional(),
});

export const AssignComplaintSchema = z.object({
  version: z.number().int().min(1),
  assigneeId: z.string().uuid('Valid assigneeId is required'),
  priority: z.nativeEnum(Priority).optional(),
  departmentId: z.string().uuid().optional(),
  note: z.string().max(500).optional(),
});

export const HoldComplaintSchema = z.object({
  version: z.number().int().min(1),
  holdReason: z.nativeEnum(HoldReason),
  note: z.string().min(5, 'Reason details must be at least 5 characters').max(1000),
});

export const ResolveComplaintSchema = z.object({
  version: z.number().int().min(1),
  resolutionNotes: z.string().min(10, 'Resolution notes must be at least 10 characters').max(2000),
  resolutionPhotoId: z.string().uuid().optional(),
});

export const ConfirmResolutionSchema = z.object({
  version: z.number().int().min(1),
  rating: z.number().int().min(1).max(5).optional(),
  feedbackText: z.string().max(1000).optional(),
});

export const ReopenComplaintSchema = z.object({
  version: z.number().int().min(1),
  reason: z.string().min(10, 'Reopen justification must be at least 10 characters').max(1000),
});

export const DisputeComplaintSchema = z.object({
  version: z.number().int().min(1),
  reason: z.string().min(10, 'Dispute reason must be at least 10 characters').max(1000),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(2, 'Comment cannot be blank').max(2000),
  isInternal: z.boolean().default(false),
});

export const CreateFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comments: z.string().max(1000).optional(),
});
