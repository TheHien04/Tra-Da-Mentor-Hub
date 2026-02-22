// backend/schemas/mentor.schema.js
/**
 * Mentor validation schemas
 */

import { z } from "zod";
import { TRACKS } from "../constants.js";

export const createMentorSchema = z.object({
  expertise: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one expertise required")
    .max(10, "Maximum 10 expertise items"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  track: z.enum(TRACKS).describe("Career track"),
  maxMentees: z
    .number()
    .int()
    .min(1, "Max mentees must be at least 1")
    .max(100, "Max mentees cannot exceed 100"),
  mentorshipType: z.enum(["GROUP", "ONE_ON_ONE"]).default("GROUP"),
  duration: z
    .enum(["SHORT_TERM", "LONG_TERM", "MEDIUM_TERM"])
    .default("LONG_TERM"),
});

export const updateMentorSchema = createMentorSchema.partial();
