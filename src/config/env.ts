// src/config/env.ts
/**
 * Frontend environment configuration
 * Validate required env vars on startup
 */

interface EnvConfig {
  apiUrl: string;
  appName: string;
  appVersion: string;
  environment: "development" | "staging" | "production";
  logLevel: "debug" | "info" | "warn" | "error";
  isDev: boolean;
  isProd: boolean;
}

function getEnvVar(key: string, required = true): string {
  const value = import.meta.env[`VITE_${key}`];

  if (!value && required) {
    throw new Error(
      `Missing required environment variable: VITE_${key}\n` +
        `Create a .env file from .env.example and fill in the required values.`
    );
  }

  return value || "";
}

// Build config object
const env: EnvConfig = {
  apiUrl: getEnvVar("API_URL", false) || "http://localhost:5000/api",
  appName: getEnvVar("APP_NAME", false) || "Trà Đá Mentor",
  appVersion: getEnvVar("APP_VERSION", false) || "1.0.0",
  environment: (getEnvVar("ENVIRONMENT", false) as any) || "development",
  logLevel: (getEnvVar("LOG_LEVEL", false) as any) || "info",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

// Validate (with defaults, no need to throw)
if (!["development", "staging", "production"].includes(env.environment)) {
  console.warn(`Invalid VITE_ENVIRONMENT: ${env.environment}, using development`);
  env.environment = "development";
}

export default env;

// Usage in app:
// import env from '@/config/env';
// console.log(env.apiUrl);
