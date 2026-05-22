import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(12, "JWT_SECRET must be at least 12 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  FINNHUB_API_KEY: z.string().min(1, "FINNHUB_API_KEY is required"),
  FINNHUB_BASE_URL: z.string().url().default("https://finnhub.io/api/v1"),
  ALERT_POLL_INTERVAL_MS: z.coerce.number().default(60000),
  WEB_ORIGIN: z.string().default("*"),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid environment variables: ${message}`);
}

export const env = parsed.data;
