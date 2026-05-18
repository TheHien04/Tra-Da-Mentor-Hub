// backend/schemas/auth.schema.js
/**
 * Authentication validation schemas
 * Using Zod for runtime validation
 */

import { z } from "zod";

// ============ LOGIN ============
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// ============ REGISTER ============
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain uppercase letter")
      .regex(/[a-z]/, "Password must contain lowercase letter")
      .regex(/[0-9]/, "Password must contain number"),
    confirmPassword: z.string(),
    name: z
      .string()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name cannot exceed 100 characters"),
    role: z.enum(["user", "mentor", "mentee", "admin"]).default("user"),
    inviteToken: z.string().min(1).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.role !== "admin" || Boolean(data.inviteToken), {
    message: "Admin registration requires a valid invite",
    path: ["role"],
  });

// ============ REFRESH TOKEN ============
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const emailOnlySchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format").toLowerCase(),
});

export const resetPasswordBodySchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain uppercase letter")
      .regex(/[a-z]/, "Password must contain lowercase letter")
      .regex(/[0-9]/, "Password must contain number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
