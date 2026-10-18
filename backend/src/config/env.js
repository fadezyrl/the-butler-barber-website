import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().optional().default(""),
  DB_MODE: z.enum(["file", "postgres"]).default("file"),
  SUPABASE_URL: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  STORAGE_BUCKET: z.string().default("cms-media"),
  JWT_SECRET: z.string().min(16).default("dev-jwt-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev-refresh-secret-change-me"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),
  NEXT_REVALIDATE_URL: z
    .string()
    .default("http://localhost:3000/api/revalidate"),
  REVALIDATE_SECRET: z.string().min(8).default("dev-revalidate-secret"),
  ADMIN_EMAIL: z.string().email().default("owner@thebutlerbarber.com"),
  ADMIN_PASSWORD: z.string().min(8).default("ChangeMeNow123!"),
  COOKIE_SECURE: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

const data = parsed.data;

export const env = {
  ...data,
  COOKIE_SECURE:
    data.COOKIE_SECURE === "true" ||
    (data.COOKIE_SECURE !== "false" && data.NODE_ENV === "production"),
};

export const hasSupabaseStorage = () =>
  Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
