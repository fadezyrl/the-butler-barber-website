import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_URL.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : undefined,
});

export const query = (text, params) => pool.query(text, params);
