// backend/config/database.js
/**
 * MongoDB connection configuration
 * Handles connection, disconnection, and reconnection logic
 */

import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

// Connection options
const mongooseOptions = {
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: "majority",
};

// URI builder
function getMongoUri() {
  if (env.mongoUser && env.mongoPassword) {
    return env.databaseUrl.replace(
      "mongodb://",
      `mongodb://${env.mongoUser}:${env.mongoPassword}@`
    );
  }
  return env.databaseUrl;
}

/**
 * Connect to MongoDB
 */
export async function connectDatabase() {
  try {
    const uri = getMongoUri();

    logger.info("🔄 Connecting to MongoDB...");
    logger.debug(`   URL: ${uri.replace(/\/\/.+@/, "//***:***@")}`);

    await mongoose.connect(uri, mongooseOptions);

    logger.info("✅ MongoDB connected successfully");

    // Setup event handlers
    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("error", (error) => {
      logger.error("❌ MongoDB connection error:", error.message);
    });

    return mongoose.connection;
  } catch (error) {
    logger.error("❌ Failed to connect to MongoDB:", error.message);
    // Don't exit, allow server to continue in test mode
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    logger.info("✅ MongoDB disconnected");
  } catch (error) {
    logger.error("❌ Error disconnecting MongoDB:", error.message);
  }
}

export default mongoose;
