// backend/config/env.js
/**
 * Backend environment configuration
 * Validate required env vars on startup
 */

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

const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  host: process.env.HOST || "localhost",

  // Database
  databaseUrl: getEnvVar("DATABASE_URL"),
  mongoUser: process.env.MONGO_USER || "",
  mongoPassword: process.env.MONGO_PASSWORD || "",

  // Auth
  jwtSecret: getEnvVar("JWT_SECRET"),
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  jwtRefreshSecret: getEnvVar("JWT_REFRESH_SECRET"),
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || "30d",

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // SendGrid Email
  sendgridApiKey: process.env.SENDGRID_API_KEY || "",
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || "noreply@tradamentor.com",
  sendgridFromName: process.env.SENDGRID_FROM_NAME || "Trà Đá Mentor",

  // Stripe Payment
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID || "",
  stripePremiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",

  // Security
  corsOrigin: getEnvVar("CORS_ORIGIN"),
  corsCredentials: process.env.CORS_CREDENTIALS === "true",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMaxRequests: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
  logFile: process.env.LOG_FILE || "logs/app.log",
  logFormat: process.env.LOG_FORMAT || "json",

  // Status checks
  isDev: (process.env.NODE_ENV || "development") === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

// Validate required values for production
if (env.isProduction) {
  const requiredInProd = [
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "DATABASE_URL",
    "CORS_ORIGIN",
  ];

  requiredInProd.forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ PRODUCTION ERROR: ${key} is required in production!`);
      process.exit(1);
    }
  });
}

export default env;
