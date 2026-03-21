import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  try {
    if (!env.MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is not defined");
    }
    logger.info("Connecting to MongoDB...");
    const conn = await mongoose.connect(env.MONGODB_URI, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error; 
  }
};