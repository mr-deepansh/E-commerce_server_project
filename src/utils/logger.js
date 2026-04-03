import fs from "fs";
import path from "path";
import winston from "winston";
import { randomUUID } from "crypto";

const { combine, timestamp, printf, errors, json, colorize } = winston.format;
const ENV = process.env.NODE_ENV ?? "development";
const SERVICE = process.env.SERVICE_NAME ?? "api-service";
const IS_PROD = ENV === "production";
const LOG_DIR = path.resolve(process.cwd(), "logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

//In DEV - [2025-01-01 12:00:00] INFO [api-service] (development) Message or stack
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const { service, env, ...restMeta } = meta;
    const metaStr = Object.keys(restMeta).length ? ` ${JSON.stringify(restMeta)}` : "";
    return `[${ts}] ${level} [${SERVICE}] (${ENV}) ${stack ?? message}${metaStr}`;
  })
);

//In PROD - {"timestamp":"2025-01-01T12:00:00.000Z","level":"info","service":"api-service","env":"production","message":"Message or stack"}
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: IS_PROD ? "info" : "debug",
  defaultMeta: {
    service: SERVICE,
    env: ENV,
  },
  format: IS_PROD ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    // error logs
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      format: prodFormat,
    }),
    // warn logs
    new winston.transports.File({
      filename: path.join(LOG_DIR, "warn.log"),
      level: "warn",
      format: prodFormat,
    }),
    // all logs
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      format: prodFormat,
    }),
  ],
  exitOnError: false,
});
