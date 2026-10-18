import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const passEncoded = "9%21%26iU%237yc%23xzK%2B";
const passPlain = decodeURIComponent(passEncoded);
const host = "aws-0-ap-southeast-1.pooler.supabase.com";
const attempts = [
  {
    label: "pooler user encoded pass :6543",
    url: `postgresql://postgres.mmsgdbzciwbaeqrjzwex:${passEncoded}@${host}:6543/postgres`,
  },
  {
    label: "pooler user plain pass :6543",
    url: `postgresql://postgres.mmsgdbzciwbaeqrjzwex:${encodeURIComponent(passPlain)}@${host}:6543/postgres`,
  },
  {
    label: "postgres user encoded :6543",
    url: `postgresql://postgres:${passEncoded}@${host}:6543/postgres`,
  },
  {
    label: "pooler user :5432 session",
    url: `postgresql://postgres.mmsgdbzciwbaeqrjzwex:${passEncoded}@${host}:5432/postgres`,
  },
];

for (const attempt of attempts) {
  const pool = new pg.Pool({
    connectionString: attempt.url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  try {
    const r = await pool.query("select current_user, 1 as ok");
    console.log("SUCCESS", attempt.label, r.rows);
    await pool.end();
    process.exit(0);
  } catch (e) {
    console.log("fail", attempt.label, e.code, e.message);
    await pool.end().catch(() => {});
  }
}
process.exit(1);
