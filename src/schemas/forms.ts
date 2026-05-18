// src/schemas/forms.ts
/**
 * Frontend form validation schemas
 * Mirror of backend schemas for client-side validation
 */

import { z } from "zod";

// ============ LOGIN FORM ============
export const loginFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// ============ REGISTER FORM ============
export const registerFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["user", "mentor", "mentee", "admin"]),
    inviteToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.role !== "admin" || Boolean(data.inviteToken), {
    message: "Admin registration requires an invite",
    path: ["role"],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;

const trackEnum = z.enum([
  "tech",
  "design",
  "business",
  "sales",
  "marketing",
  "hr",
  "education",
  "startup",
  "social",
  "economics",
]);

// ============ MENTOR FORM ============
export const mentorFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  expertise: z.array(z.string()).min(1, "At least one expertise required"),
  bio: z.string().max(500).optional(),
  track: trackEnum,
  maxMentees: z.number().min(1).max(100),
});

export const createMentorFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().optional(),
  track: trackEnum,
  expertise: z.string().optional(),
  bio: z.string().max(500).optional(),
  maxMentees: z.number().min(1, "Min 1 mentee slot").max(100),
  mentorshipType: z.string().optional(),
  duration: z.string().optional(),
});

export const editMentorFormSchema = createMentorFormSchema;

export type MentorFormData = z.infer<typeof mentorFormSchema>;
export type CreateMentorFormData = z.infer<typeof createMentorFormSchema>;
export type EditMentorFormData = z.infer<typeof editMentorFormSchema>;

// ============ MENTEE FORM ============
export const menteeFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  school: z.string().optional(),
  interests: z.array(z.string()).optional(),
  track: trackEnum,
});

export const createMenteeFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().optional(),
  school: z.string().min(1, "School is required"),
  track: trackEnum,
  interests: z.string().optional(),
  progress: z.number().min(0).max(100, "0–100 only"),
  mentorId: z.string().optional(),
  groupId: z.string().optional(),
});

export const editMenteeFormSchema = createMenteeFormSchema;

export type MenteeFormData = z.infer<typeof menteeFormSchema>;
export type CreateMenteeFormData = z.infer<typeof createMenteeFormSchema>;
export type EditMenteeFormData = z.infer<typeof editMenteeFormSchema>;

// ============ GROUP FORM ============
export const groupFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  topic: z.string().min(3, "Name must be at least 3 characters"),
  maxCapacity: z.number().min(1).max(100),
});

export const addGroupFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  mentorId: z.string().min(1, "Select a mentor"),
  frequency: z.string().min(1),
  dayOfWeek: z.string().min(1),
  time: z.string().min(1),
});

export const editGroupFormSchema = addGroupFormSchema;

export type GroupFormData = z.infer<typeof groupFormSchema>;
export type AddGroupFormData = z.infer<typeof addGroupFormSchema>;
export type EditGroupFormData = z.infer<typeof editGroupFormSchema>;
