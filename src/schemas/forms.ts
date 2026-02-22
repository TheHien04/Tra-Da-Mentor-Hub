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
    role: z.enum(["user", "mentor", "mentee"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;

// ============ MENTOR FORM ============
export const mentorFormSchema = z.object({
  name: z.string().min(3, "Name required"),
  expertise: z.array(z.string()).min(1, "At least one expertise required"),
  bio: z.string().max(500).optional(),
  track: z.enum([
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
  ]),
  maxMentees: z.number().min(1).max(100),
});

export type MentorFormData = z.infer<typeof mentorFormSchema>;

// ============ MENTEE FORM ============
export const menteeFormSchema = z.object({
  name: z.string().min(3),
  school: z.string().optional(),
  interests: z.array(z.string()).optional(),
  track: z.enum([
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
  ]),
});

export type MenteeFormData = z.infer<typeof menteeFormSchema>;

// ============ GROUP FORM ============
export const groupFormSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10).max(500),
  topic: z.string().min(3),
  maxCapacity: z.number().min(1).max(100),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;
