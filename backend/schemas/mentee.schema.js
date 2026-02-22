// backend/schemas/mentee.schema.js
/**
 * Mentee validation schemas
 */

import { z } from "zod";
import { TRACKS } from "../constants.js";

export const createMenteeSchema = z.object({
  school: z.string().max(200).optional(),
  interests: z
    .array(z.string().min(1).max(100))
    .max(10, "Maximum 10 interests allowed")
    .default([]),
  goals: z
    .array(z.string().min(1).max(200))
    .max(5, "Maximum 5 goals allowed")
    .default([]),
  track: z.enum(TRACKS).describe("Career track"),
  mentorshipType: z.enum(["GROUP", "ONE_ON_ONE"]).default("GROUP"),
});

export const updateMenteeSchema = createMenteeSchema.partial().extend({
  progress: z.number().min(0).max(100).optional(),
});
