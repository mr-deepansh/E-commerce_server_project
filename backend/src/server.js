import app from "./app";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";

dotenv.config({
  quiet: true,
  path: ".env",
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(`🚀 Server started on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("❌ Startup failed", error);
    process.exit(1);
  }
};

startServer();
