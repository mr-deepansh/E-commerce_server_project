// src/common/schemas/field.schemas.js
import { z } from "zod";

const EMAIL_RULES = Object.freeze({
  MIN_LENGTH: 5,
  MAX_LENGTH: 254,
  LOCAL_MAX: 64,
  LABEL_MAX: 63,
  DOMAIN_MAX: 255,
});

const NAME_RULES = Object.freeze({
  FIRST_MIN: 2,
  FIRST_MAX: 50,
  LAST_MIN: 2,
  LAST_MAX: 50,
});

const USERNAME_RULES = Object.freeze({
  MIN: 3,
  MAX: 20,
});

const PASSWORD_RULES = Object.freeze({
  MIN: 8,
  MAX: 128,
});

const REGEX = Object.freeze({
  LOCAL_CHARS: /^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~.\-]+$/,
  DOMAIN_LABEL: /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
  TLD: /^[a-zA-Z]{2,24}$/,
  NAME: /^[\p{L}\p{M}'\-\s]+$/u,
  OPTIONAL_NAME: /^[\p{L}\p{M}'\-\s]*$/u,
  USERNAME: /^[a-z0-9._-]+$/,
  PASSWORD_STRENGTH:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/,
});

const BLOCKED_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "sharklasers.com",
  "yopmail.com",
  "trashmail.com",
  "10minutemail.com",
  "fakeinbox.com",
  "tempinbox.com",
  "dispostable.com",
  "mailnull.com",
  "spamgourmet.com",
  "trashmail.at",
  "trashmail.io",
  "trashmail.me",
  "discard.email",
  "spam4.me",
  "getairmail.com",
  "filzmail.com",
  "maildrop.cc",
  "spambox.us",
  "tempr.email",
  "getnada.com",
  "anonaddy.com",
  "spamherelots.com",
  "mailnesia.com",
  "throwam.com",
  "temp-mail.org",
  "emailondeck.com",
  "tempail.com",
  "tmpeml.com",
  "inboxkitten.com",
]);

const isValidLocalPart = (local) => {
  if (!local || local.length > EMAIL_RULES.LOCAL_MAX) return false;
  if (local.startsWith(".") || local.endsWith(".")) return false;
  if (local.includes("..")) return false;
  return REGEX.LOCAL_CHARS.test(local);
};
const isValidDomain = (domain) => {
  if (!domain || domain.length > EMAIL_RULES.DOMAIN_MAX) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  const tld = labels.at(-1);
  if (!REGEX.TLD.test(tld)) return false;
  return labels.every(
    (label) =>
      label.length >= 1 && label.length <= EMAIL_RULES.LABEL_MAX && REGEX.DOMAIN_LABEL.test(label)
  );
};
const isNotDisposable = (domain) => !BLOCKED_DOMAINS.has(domain.toLowerCase());
export const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .min(EMAIL_RULES.MIN_LENGTH, "Email is too short")
  .max(EMAIL_RULES.MAX_LENGTH, "Email is too long")
  .email("Invalid email format")
  .superRefine((email, ctx) => {
    const atIndex = email.lastIndexOf("@");
    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    if (!isValidLocalPart(local)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Email local part is invalid — avoid leading/trailing dots, consecutive dots, or unsupported characters",
      });
    }
    if (!isValidDomain(domain)) {
      ctx.addIssue({ code: "custom", message: "Email domain is invalid" });
    }
    if (!isNotDisposable(domain)) {
      ctx.addIssue({
        code: "custom",
        message: "Disposable email addresses are not permitted",
      });
    }
  });
export const usernameSchema = z
  .string({ required_error: "Username is required" })
  .trim()
  .toLowerCase()
  .min(USERNAME_RULES.MIN, `Username must be at least ${USERNAME_RULES.MIN} characters`)
  .max(USERNAME_RULES.MAX, `Username must be at most ${USERNAME_RULES.MAX} characters`)
  .regex(
    REGEX.USERNAME,
    "Username may only contain lowercase letters, numbers, dots, underscores, or hyphens"
  )
  .refine((u) => !u.startsWith(".") && !u.endsWith(".") && !u.startsWith("-") && !u.endsWith("-"), {
    message: "Username cannot start or end with a dot or hyphen", // ✅ added hyphen check
  })
  .refine((u) => !u.includes("..") && !u.includes("--"), {
    message: "Username cannot contain consecutive dots or hyphens", // ✅ added -- check
  });
export const firstNameSchema = z
  .string({ required_error: "First name is required" })
  .trim()
  .min(NAME_RULES.FIRST_MIN, `First name must be at least ${NAME_RULES.FIRST_MIN} characters`)
  .max(NAME_RULES.FIRST_MAX, `First name must be at most ${NAME_RULES.FIRST_MAX} characters`)
  .regex(REGEX.NAME, "First name contains invalid characters");
export const lastNameSchema = z
  .string()
  .trim()
  .min(NAME_RULES.LAST_MIN, `Last name must be at least ${NAME_RULES.LAST_MIN} characters`)
  .max(NAME_RULES.LAST_MAX, `Last name must be at most ${NAME_RULES.LAST_MAX} characters`)
  .regex(REGEX.NAME, "Last name contains invalid characters")
  .optional();
export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(PASSWORD_RULES.MIN, `Password must be at least ${PASSWORD_RULES.MIN} characters`)
  .max(PASSWORD_RULES.MAX, `Password must be at most ${PASSWORD_RULES.MAX} characters`)
  .regex(
    REGEX.PASSWORD_STRENGTH,
    "Password must include uppercase, lowercase, number, and special character"
  )
  .refine((pwd) => !/\s/.test(pwd), {
    message: "Password must not contain spaces",
  });
export const confirmPasswordSchema = z
  .string({ required_error: "Please confirm your password" })
  .min(PASSWORD_RULES.MIN, "Confirmation password is too short")
  .max(PASSWORD_RULES.MAX, "Confirmation password is too long");

// Environment variable schemas
const isProd = process.env.NODE_ENV === "production";

export const portSchema = z.coerce.number().min(1024).max(65535);
export const nodeEnvSchema = z.enum(["development", "production", "test"]);
export const apiVersionSchema = z.string().regex(/^v\d+$/, "Must be like v1, v2");
export const urlSchema = z.string().url();
export const positiveNumberSchema = z.coerce.number().min(1);
export const nonNegativeNumberSchema = z.coerce.number().min(0);
export const durationSchema = z.string().regex(/^\d+[smhd]$/, "Must be like 15m, 1h, 7d");
export const secretSchema = (minDev, minProd) =>
  isProd
    ? z.string().min(minProd, `Must be at least ${minProd} chars in production`)
    : z.string().min(minDev, `Must be at least ${minDev} chars`);
export const smtpStringSchema = isProd ? z.string().min(1) : z.string().min(1).optional();
export const logLevelSchema = z.enum(["error", "warn", "info", "http", "debug"]);
export const logFormatSchema = z.enum(["dev", "combined", "json"]);
export const cookieSameSiteSchema = z.enum(["strict", "lax", "none"]);
