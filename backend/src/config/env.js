import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URI: z
    .string({
      required_error: "❌ MONGODB_URI is required",
    })
    .min(1, "❌ MONGODB_URI cannot be empty"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse(process.env);
