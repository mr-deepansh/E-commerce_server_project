import fs from "fs";
import path from "path";

import winston from "winston";

const { combine, timestamp, printf, errors, json, colorize } = winston.format;

const LOG_DIR = "logs";

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

const SERVICE_NAME = "api-service";
const ENV = process.env.NODE_ENV;
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}] [${SERVICE_NAME}] (${ENV}) ${stack || message}`;
});

const prodFormat = json();

export const logger = winston.createLogger({
  level: ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    ENV === "production" ? prodFormat : devFormat
  ),
  transports: [
    // console
    new winston.transports.Console({
      format: ENV === "production" ? combine(timestamp(), json()) : combine(colorize(), devFormat),
    }),
    // error logs
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
    }),
    // all logs
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
    }),
  ],
  exitOnError: false,
});
