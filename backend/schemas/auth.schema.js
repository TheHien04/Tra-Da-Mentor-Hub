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
    role: z.enum(["user", "mentor", "mentee"]).default("user"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ============ REFRESH TOKEN ============
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
