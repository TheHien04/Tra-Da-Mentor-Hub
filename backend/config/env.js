// backend/config/env.js
/**
 * Backend environment configuration
 * Validate required env vars on startup
 */

import { resolvePlatformPublicUrl } from "./publicUrl.js";
import { assertProductionSecrets } from "../lib/secretValidation.js";

const nodeEnv = process.env.NODE_ENV || "development";
const isTest = nodeEnv === "test";
const isDev = nodeEnv === "development";
const isProduction = nodeEnv === "production";

const platformPublicUrl = resolvePlatformPublicUrl();

const CI_TEST_JWT =
  "ci-test-jwt-secret-minimum-sixty-four-characters-long-for-jest-and-playwright";
const CI_TEST_REFRESH =
  "ci-test-jwt-refresh-secret-minimum-sixty-four-characters-long-for-ci-only";

function getEnvVar(key, required = true) {
  const value = process.env[key];

  if (!value && required) {
    console.error(
      `❌ Missing required environment variable: ${key}\n` +
        `Create a .env file from .env.example and fill in the required values.`
    );
    process.exit(1);
  }

  return value || "";
}

const defaultDevOrigin = "http://localhost:5173";
const publicAppUrl =
  process.env.CORS_ORIGIN?.trim() ||
  process.env.FRONTEND_URL?.trim() ||
  process.env.BASE_URL?.trim() ||
  platformPublicUrl ||
  (isTest || isDev ? defaultDevOrigin : "");

const env = {
  nodeEnv,
  isDev,
  isProduction,
  isTest,
  platformPublicUrl,

  port: parseInt(process.env.PORT || "5000", 10),
  host: process.env.HOST || (isProduction ? "0.0.0.0" : "localhost"),

  databaseUrl:
    process.env.DATABASE_URL ||
    (isTest || isDev
      ? "mongodb://127.0.0.1:27017/tra-da-mentor"
      : getEnvVar("DATABASE_URL")),
  mongoUser: process.env.MONGO_USER || "",
  mongoPassword: process.env.MONGO_PASSWORD || "",

  jwtSecret:
    process.env.JWT_SECRET || (isTest ? CI_TEST_JWT : getEnvVar("JWT_SECRET")),
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    (isTest ? CI_TEST_REFRESH : getEnvVar("JWT_REFRESH_SECRET")),
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || "30d",

  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  apiUrl:
    process.env.API_PUBLIC_URL?.trim() ||
    `${process.env.BASE_URL?.trim() || platformPublicUrl || `http://localhost:${process.env.PORT || "5000"}`}/api`,
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  frontendUrl: process.env.FRONTEND_URL?.trim() || platformPublicUrl || defaultDevOrigin,
  baseUrl:
    process.env.BASE_URL?.trim() ||
    platformPublicUrl ||
    `http://localhost:${process.env.PORT || "5000"}`,

  sendgridApiKey: process.env.SENDGRID_API_KEY || "",
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || "noreply@tradamentor.com",
  sendgridFromName: process.env.SENDGRID_FROM_NAME || "Trà Đá Mentor",

  zaloOaAccessToken: process.env.ZALO_OA_ACCESS_TOKEN || "",
  zaloBroadcastUserIds: process.env.ZALO_BROADCAST_USER_IDS || "",

  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID || "",
  stripePremiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",

  corsOrigin: publicAppUrl || (isTest || isDev ? defaultDevOrigin : getEnvVar("CORS_ORIGIN")),
  corsOrigins: (publicAppUrl || (isTest || isDev ? defaultDevOrigin : getEnvVar("CORS_ORIGIN")))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  corsCredentials: process.env.CORS_CREDENTIALS !== "false",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMaxRequests: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),

  logLevel: process.env.LOG_LEVEL || "info",
  logFile: process.env.LOG_FILE || "logs/app.log",
  logFormat: process.env.LOG_FORMAT || "json",
};

if (env.isProduction) {
  const requiredInProd = ["JWT_SECRET", "JWT_REFRESH_SECRET", "DATABASE_URL"];

  requiredInProd.forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ PRODUCTION ERROR: ${key} is required in production!`);
      process.exit(1);
    }
  });

  if (!env.corsOrigin) {
    console.error(
      "❌ PRODUCTION ERROR: Set CORS_ORIGIN or deploy on Railway/Render (auto-detect public URL)"
    );
    process.exit(1);
  }

  if (platformPublicUrl) {
    console.info(`🌐 Public URL (auto): ${platformPublicUrl}`);
  }

  const warnings = [];
  if (!env.sendgridApiKey) {
    warnings.push("SENDGRID_API_KEY not set — email broadcast disabled");
  }
  if (!env.zaloOaAccessToken) {
    warnings.push("ZALO_OA_ACCESS_TOKEN not set — Zalo broadcast disabled");
  }
  if (!env.stripeSecretKey) {
    warnings.push("STRIPE_SECRET_KEY not set — payments disabled");
  }
  if (!env.googleClientId) {
    warnings.push("GOOGLE_CLIENT_ID not set — Google SSO disabled");
  }
  if (warnings.length) {
    console.warn("⚠️ Production configuration warnings:\n  - " + warnings.join("\n  - "));
  }

  assertProductionSecrets(env);
}

export default env;
