// backend/src/modules/auth/auth.schema.js
import { z } from "zod";

const EMAIL_RULES = Object.freeze({
  MIN_LENGTH: 5,
  MAX_LENGTH: 254,
  LOCAL_MAX: 64,
  LABEL_MAX: 63,
  DOMAIN_MAX: 255,
});

const REGEX = Object.freeze({
  LOCAL_CHARS: /^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~.\-]+$/,
  DOMAIN_LABEL: /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
  TLD: /^[a-zA-Z]{2,24}$/,
  NAME: /^[\p{L}\p{M}'\-\s]+$/u,
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

// Field Schemas
const emailSchema = z
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
      ctx.addIssue({
        code: "custom",
        message: "Email domain is invalid",
      });
    }
    if (!isNotDisposable(domain)) {
      ctx.addIssue({
        code: "custom",
        message: "Disposable email addresses are not permitted",
      });
    }
  });

const usernameSchema = z
  .string({ required_error: "Username is required" })
  .trim()
  .toLowerCase()
  .min(5, "Username must be at least 5 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    REGEX.USERNAME,
    "Username may only contain lowercase letters, numbers, dots, underscores, or hyphens"
  )
  .refine((u) => !u.startsWith(".") && !u.endsWith("."), {
    message: "Username cannot start or end with a dot",
  })
  .refine((u) => !u.includes(".."), {
    message: "Username cannot contain consecutive dots",
  });

const nameSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(5, "First name must be at least 5 characters")
    .max(50, "First name must be at most 50 characters")
    .regex(REGEX.NAME, "First name contains invalid characters"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters")
    .regex(/^[\p{L}\p{M}'\-\s]*$/u, "Last name contains invalid characters")
    .optional(),
});

const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(
    REGEX.PASSWORD_STRENGTH,
    "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
  )
  .refine((pwd) => !/\s/.test(pwd), {
    message: "Password must not contain spaces",
  });

// Composite Schemas
export const registerSchema = z
  .object({
    firstName: nameSchema.shape.firstName,
    lastName: nameSchema.shape.lastName,
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string({ required_error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "Email or username is required" })
    .trim()
    .min(3, "Email or username is too short"),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: "Reset token is required" }).min(1),
    password: passwordSchema,
    confirmPassword: z.string({ required_error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
