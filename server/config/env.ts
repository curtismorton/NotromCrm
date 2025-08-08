import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  GMAIL_CLIENT_ID: z.string().min(1, "GMAIL_CLIENT_ID is required"),
  GMAIL_CLIENT_SECRET: z.string().min(1, "GMAIL_CLIENT_SECRET is required"),
  GMAIL_REDIRECT_URI: z.string().url("GMAIL_REDIRECT_URI must be a valid URL"),
  GMAIL_REFRESH_TOKEN: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;