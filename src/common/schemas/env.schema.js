// src/common/schemas/env.schema.js
import { z } from "zod";
import {
  portSchema,
  nodeEnvSchema,
  apiVersionSchema,
  urlSchema,
  positiveNumberSchema,
  nonNegativeNumberSchema,
  durationSchema,
  secretSchema,
  smtpStringSchema,
  logLevelSchema,
  logFormatSchema,
  cookieSameSiteSchema,
  emailSchema,
} from "./field.schemas.js";
import { logger } from "../../utils/logger.js";

const ENV_CONSTANTS = Object.freeze({
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  WILDCARD_ORIGIN: "*",
  LOCALHOST_PATTERNS: ["localhost", "127.0.0.1", "0.0.0.0"],
  EXIT_CODE_VALIDATION_ERROR: 1,
});

const isProd = process.env.NODE_ENV === ENV_CONSTANTS.PRODUCTION;

export const createEnvSchema = () =>
  z.object({
    PORT: portSchema,
    NODE_ENV: nodeEnvSchema,
    SERVICE_NAME: z.string().min(1, "Service name is required"),
    API_VERSION: apiVersionSchema,
    ALLOWED_ORIGINS: z.string().min(1, "Allowed origins must be specified"),
    CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
    MONGODB_URI: urlSchema,
    DB_MAX_POOL_SIZE: positiveNumberSchema.max(100),
    DB_MIN_POOL_SIZE: nonNegativeNumberSchema,
    DB_SOCKET_TIMEOUT_MS: positiveNumberSchema,
    DB_SERVER_SELECTION_TIMEOUT_MS: positiveNumberSchema,
    DB_HEARTBEAT_FREQUENCY_MS: positiveNumberSchema,
    DB_MAX_RETRIES: positiveNumberSchema.max(10),
    DB_RETRY_DELAY_MS: positiveNumberSchema,
    GRACEFUL_SHUTDOWN_TIMEOUT_MS: positiveNumberSchema,
    REQUEST_TIMEOUT_MS: positiveNumberSchema,
    BODY_LIMIT: z.string().min(1),
    JWT_ACCESS_SECRET: secretSchema(32, 64),
    JWT_REFRESH_SECRET: secretSchema(32, 64),
    JWT_ACCESS_EXPIRY: durationSchema,
    JWT_REFRESH_EXPIRY: durationSchema,
    ACCESS_TOKEN_SECRET: secretSchema(32, 64),
    JWT_EXPIRES_IN: durationSchema,
    BCRYPT_SALT_ROUNDS: z.coerce.number(),
    MIN_BCRYPT_ROUNDS: z.coerce.number(),
    MAX_BCRYPT_ROUNDS: z.coerce.number(),
    RATE_LIMIT_WINDOW_MS: positiveNumberSchema,
    RATE_LIMIT_MAX_REQUESTS: positiveNumberSchema,
    AUTH_RATE_LIMIT_WINDOW_MS: positiveNumberSchema,
    AUTH_RATE_LIMIT_MAX_REQUESTS: positiveNumberSchema,
    MAX_LOGIN_ATTEMPTS: z.coerce.number(),
    MIN_LOGIN_ATTEMPTS: z.coerce.number(),
    MAX_LOGIN_ATTEMPTS_LIMIT: z.coerce.number(),
    LOCK_DURATION_MS: z.coerce.number(),
    MIN_LOCK_DURATION_MS: z.coerce.number(),
    SMTP_HOST: smtpStringSchema,
    SMTP_PORT: z.coerce.number(),
    SMTP_SECURE: z.coerce.boolean(),
    SMTP_USER: smtpStringSchema,
    SMTP_PASS: smtpStringSchema,
    EMAIL_FROM: emailSchema.optional(),
    EMAIL_FROM_NAME: z.string().min(1),
    EMAIL_VERIFICATION_EXPIRY_MS: positiveNumberSchema,
    PASSWORD_RESET_EXPIRY_MS: z.coerce.number(),
    MIN_PASSWORD_RESET_EXPIRY_MS: z.coerce.number(),
    MAX_PASSWORD_RESET_EXPIRY_MS: z.coerce.number(),
    COOKIE_SECRET: secretSchema(16, 32),
    COOKIE_SECURE: z.coerce.boolean(),
    COOKIE_SAME_SITE: cookieSameSiteSchema,
    LOG_LEVEL: logLevelSchema,
    LOG_FORMAT: logFormatSchema,
  });

const validateSecurityThresholds = (data, ctx) => {
  if (data.BCRYPT_SALT_ROUNDS < data.MIN_BCRYPT_ROUNDS) {
    ctx.addIssue({
      path: ["BCRYPT_SALT_ROUNDS"],
      code: z.ZodIssueCode.custom,
      message: `BCRYPT_SALT_ROUNDS (${data.BCRYPT_SALT_ROUNDS}) is below minimum (${data.MIN_BCRYPT_ROUNDS})`,
    });
  }
  if (data.BCRYPT_SALT_ROUNDS > data.MAX_BCRYPT_ROUNDS) {
    ctx.addIssue({
      path: ["BCRYPT_SALT_ROUNDS"],
      code: z.ZodIssueCode.custom,
      message: `BCRYPT_SALT_ROUNDS (${data.BCRYPT_SALT_ROUNDS}) exceeds maximum (${data.MAX_BCRYPT_ROUNDS})`,
    });
  }
  if (data.MAX_LOGIN_ATTEMPTS < data.MIN_LOGIN_ATTEMPTS) {
    ctx.addIssue({
      path: ["MAX_LOGIN_ATTEMPTS"],
      code: z.ZodIssueCode.custom,
      message: `MAX_LOGIN_ATTEMPTS (${data.MAX_LOGIN_ATTEMPTS}) is below minimum (${data.MIN_LOGIN_ATTEMPTS})`,
    });
  }
  if (data.MAX_LOGIN_ATTEMPTS > data.MAX_LOGIN_ATTEMPTS_LIMIT) {
    ctx.addIssue({
      path: ["MAX_LOGIN_ATTEMPTS"],
      code: z.ZodIssueCode.custom,
      message: `MAX_LOGIN_ATTEMPTS (${data.MAX_LOGIN_ATTEMPTS}) exceeds limit (${data.MAX_LOGIN_ATTEMPTS_LIMIT})`,
    });
  }
  if (data.LOCK_DURATION_MS < data.MIN_LOCK_DURATION_MS) {
    ctx.addIssue({
      path: ["LOCK_DURATION_MS"],
      code: z.ZodIssueCode.custom,
      message: `LOCK_DURATION_MS (${data.LOCK_DURATION_MS}) is below minimum (${data.MIN_LOCK_DURATION_MS})`,
    });
  }
  if (data.PASSWORD_RESET_EXPIRY_MS < data.MIN_PASSWORD_RESET_EXPIRY_MS) {
    ctx.addIssue({
      path: ["PASSWORD_RESET_EXPIRY_MS"],
      code: z.ZodIssueCode.custom,
      message: `PASSWORD_RESET_EXPIRY_MS (${data.PASSWORD_RESET_EXPIRY_MS}) is below minimum (${data.MIN_PASSWORD_RESET_EXPIRY_MS})`,
    });
  }
  if (data.PASSWORD_RESET_EXPIRY_MS > data.MAX_PASSWORD_RESET_EXPIRY_MS) {
    ctx.addIssue({
      path: ["PASSWORD_RESET_EXPIRY_MS"],
      code: z.ZodIssueCode.custom,
      message: `PASSWORD_RESET_EXPIRY_MS (${data.PASSWORD_RESET_EXPIRY_MS}) exceeds maximum (${data.MAX_PASSWORD_RESET_EXPIRY_MS})`,
    });
  }
};

const validateProductionSecurity = (data, ctx) => {
  if (data.NODE_ENV !== ENV_CONSTANTS.PRODUCTION) return;
  if (data.ALLOWED_ORIGINS === ENV_CONSTANTS.WILDCARD_ORIGIN) {
    ctx.addIssue({
      path: ["ALLOWED_ORIGINS"],
      code: z.ZodIssueCode.custom,
      message: "Wildcard CORS origin (*) is not allowed in production for security reasons",
    });
  }

  const hasLocalhost = ENV_CONSTANTS.LOCALHOST_PATTERNS.some((pattern) =>
    data.MONGODB_URI.includes(pattern)
  );
  if (hasLocalhost) {
    ctx.addIssue({
      path: ["MONGODB_URI"],
      code: z.ZodIssueCode.custom,
      message: "Cannot connect to localhost/127.0.0.1 MongoDB in production",
    });
  }
  if (!data.SMTP_HOST || !data.SMTP_USER || !data.SMTP_PASS) {
    ctx.addIssue({
      path: ["SMTP_HOST"],
      code: z.ZodIssueCode.custom,
      message: "SMTP configuration (HOST, USER, PASS) is required in production",
    });
  }
  if (!data.COOKIE_SECURE) {
    ctx.addIssue({
      path: ["COOKIE_SECURE"],
      code: z.ZodIssueCode.custom,
      message: "COOKIE_SECURE must be true in production",
    });
  }
  if (data.COOKIE_SAME_SITE === "none" && !data.COOKIE_SECURE) {
    ctx.addIssue({
      path: ["COOKIE_SAME_SITE"],
      code: z.ZodIssueCode.custom,
      message: "COOKIE_SAME_SITE=none requires COOKIE_SECURE=true",
    });
  }
};

const validateDatabasePooling = (data, ctx) => {
  if (data.DB_MIN_POOL_SIZE > data.DB_MAX_POOL_SIZE) {
    ctx.addIssue({
      path: ["DB_MIN_POOL_SIZE"],
      code: z.ZodIssueCode.custom,
      message: `DB_MIN_POOL_SIZE (${data.DB_MIN_POOL_SIZE}) cannot exceed DB_MAX_POOL_SIZE (${data.DB_MAX_POOL_SIZE})`,
    });
  }
};

const validateRateLimiting = (data, ctx) => {
  if (data.AUTH_RATE_LIMIT_MAX_REQUESTS > data.RATE_LIMIT_MAX_REQUESTS) {
    ctx.addIssue({
      path: ["AUTH_RATE_LIMIT_MAX_REQUESTS"],
      code: z.ZodIssueCode.custom,
      message:
        "AUTH_RATE_LIMIT_MAX_REQUESTS should not exceed RATE_LIMIT_MAX_REQUESTS for security",
    });
  }
};

const createFinalSchema = () => {
  const baseSchema = createEnvSchema();
  return baseSchema.superRefine((data, ctx) => {
    validateSecurityThresholds(data, ctx);
    validateProductionSecurity(data, ctx);
    validateDatabasePooling(data, ctx);
    validateRateLimiting(data, ctx);
  });
};

const formatValidationError = (error) => {
  const errorLines = error.issues.map(({ path, message }) => {
    const fieldName = path.join(".").padEnd(35);
    return `   ${fieldName} → ${message}`;
  });

  return [
    "\n❌ Environment variable validation failed:\n",
    ...errorLines,
    "\n💡 Check your .env file against .env.example\n",
  ].join("\n");
};

export const validateEnv = () => {
  try {
    const schema = createFinalSchema();
    const result = schema.safeParse(process.env);
    if (!result.success) {
      logger.error(formatValidationError(result.error));
      process.exit(ENV_CONSTANTS.EXIT_CODE_VALIDATION_ERROR);
    }
    return Object.freeze(result.data);
  } catch (error) {
    logger.error("\n❌ Critical error during environment validation:");
    logger.error(`   ${error.message}\n`);
    process.exit(ENV_CONSTANTS.EXIT_CODE_VALIDATION_ERROR);
  }
};

let cachedEnv = null;

export const getEnv = () => {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
};

export const env = getEnv();

export { ENV_CONSTANTS };
