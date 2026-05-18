import mongoose from "mongoose";
import env from "../config/env.js";

export function getHealthPayload() {
  const mongoReady = mongoose.connection.readyState === 1;
  const unhealthy = env.isProduction && !mongoReady;
  const base = {
    status: unhealthy ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    storage: mongoReady ? "mongodb" : "memory",
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
