// backend/schemas/group.schema.js
/**
 * Group validation schemas
 */

import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(100, "Name cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),
  topic: z.string().min(1, "Topic is required").max(100),
  maxCapacity: z
    .number()
    .int()
    .min(1, "Max capacity must be at least 1")
    .max(100),
  meetingSchedule: z
    .object({
      frequency: z.enum(["Weekly", "Bi-weekly", "Monthly"]),
      dayOfWeek: z.string().optional(),
      time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM format"),
    })
    .optional(),
});

export const updateGroupSchema = createGroupSchema.partial();
