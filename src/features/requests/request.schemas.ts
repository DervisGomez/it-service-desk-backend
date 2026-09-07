import { RequestPriority, RequestStatus } from "@prisma/client";
import { z } from "zod";

const requestPrioritySchema = z.enum([
  RequestPriority.LOW,
  RequestPriority.MEDIUM,
  RequestPriority.HIGH,
  RequestPriority.CRITICAL,
]);

const requestStatusSchema = z.enum([
  RequestStatus.PENDING,
  RequestStatus.ASSIGNED,
  RequestStatus.IN_PROGRESS,
  RequestStatus.RESOLVED,
  RequestStatus.CANCELLED,
]);

export const createRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(120, "El título no puede superar los 120 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no puede superar los 1000 caracteres"),
  priority: requestPrioritySchema.optional(),
  technicianId: z.number().int().positive().optional(),
  serviceTypeId: z.number().int().positive(),
});

export const updateRequestSchema = createRequestSchema.partial().extend({
  status: requestStatusSchema.optional(),
  technicianId: z.number().int().positive().nullable().optional(),
});

export const requestIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const requestQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: requestStatusSchema.optional(),
  priority: requestPrioritySchema.optional(),
  technicianId: z.coerce.number().int().positive().optional(),
  serviceTypeId: z.coerce.number().int().positive().optional(),
  page: z.coerce
    .number()
    .int()
    .min(1, "La página debe ser mayor o igual a 1")
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "El límite debe ser mayor o igual a 1")
    .max(100, "El límite máximo permitido es 100")
    .default(10),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type RequestIdParams = z.infer<typeof requestIdSchema>;
export type RequestQuery = z.infer<typeof requestQuerySchema>;
