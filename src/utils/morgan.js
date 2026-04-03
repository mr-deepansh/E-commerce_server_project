import morgan from "morgan";
import { logger } from "./logger.js";

const ENV = process.env.NODE_ENV;
const IS_DEV = ENV !== "production";

const stream = {
  write: (message) => {
    try {
      const logData = JSON.parse(message.trim());
      logData.status = parseInt(logData.status, 10);
      logData.responseTime = parseFloat(logData.responseTime);
      if (logData.contentLength && logData.contentLength !== "-") {
        logData.contentLength = parseInt(logData.contentLength, 10);
      }
      logger.http(logData);
    } catch (error) {
      logger.http(message.trim());
    }
  },
};

morgan.token("request-id", (req) => req.requestId ?? "-");
morgan.token("body", (req) => {
  if (IS_DEV && req.body && Object.keys(req.body).length > 0) {
    const sanitized = { ...req.body };
    if (sanitized.password) sanitized.password = "***";
    if (sanitized.confirmPassword) sanitized.confirmPassword = "***";
    if (sanitized.refreshToken) sanitized.refreshToken = "***";
    return JSON.stringify(sanitized);
  }
  return "-";
});

const FORMAT = JSON.stringify({
  method: ":method",
  url: ":url",
  status: ":status",
  responseTime: ":response-time",
  contentLength: ":res[content-length]",
  ip: ":remote-addr",
  userAgent: ":user-agent",
  requestId: ":request-id",
  body: ":body",
});

const HEALTHCHECK_PATHS = new Set(["/", "/health", "/api/health"]);
const skip = (req) => HEALTHCHECK_PATHS.has(req.url);

export const morganMiddleware = morgan(FORMAT, { stream, skip });
