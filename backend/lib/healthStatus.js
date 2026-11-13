import mongoose from "mongoose";
import env from "../config/env.js";

function storageState() {
  const mongoReady = mongoose.connection.readyState === 1;
  return { mongoReady, storage: mongoReady ? "mongodb" : "memory" };
}

export function getLivenessPayload() {
  const { storage } = storageState();
  return {
    status: "ok",
    check: "liveness",
    timestamp: new Date().toISOString(),
    storage,
  };
}

export function getReadinessPayload() {
  const { mongoReady, storage } = storageState();
  const unhealthy = env.isProduction && !mongoReady;
  const base = {
    status: unhealthy ? "degraded" : "ok",
    check: "readiness",
    timestamp: new Date().toISOString(),
    storage,
    ...(unhealthy ? { message: "MongoDB connection required in production" } : {}),
  };

  if (env.isProduction) {
    return base;
  }

  return {
    ...base,
    message: "Server is running",
    environment: env.nodeEnv,
    features: {
      email: Boolean(env.sendgridApiKey),
      zalo: Boolean(env.zaloOaAccessToken),
      stripe: Boolean(env.stripeSecretKey),
      googleOAuth: Boolean(env.googleClientId && env.googleClientSecret),
      googleCalendar: Boolean(env.googleClientId && env.googleClientSecret),
      openai: Boolean(env.openaiApiKey),
    },
  };
}

// Backward-compatible export for internal consumers; readiness is the stricter check.
export const getHealthPayload = getReadinessPayload;
