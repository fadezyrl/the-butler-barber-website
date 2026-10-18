# The Butler Barber — CMS API

Express API for the website CMS. Admins edit content from the Next.js `/admin` UI; the public site reads published content via ISR.

## Quick start (local)

```bash
cp .env.example .env
# Ensure ADMIN_* / JWT_* / REVALIDATE_SECRET match frontend/.env.local

npm install
npm run seed:file
npm run dev
```

API: `http://localhost:4000`

Default owner login (change after first login):

- Email: `owner@thebutlerbarber.com`
- Password: `ChangeMeNow123!`

## Storage modes

| `DB_MODE` | Behaviour |
|-----------|-----------|
| `file` (default) | Persists to `data/cms-store.json`. Works offline; good for local/dev. |
| `postgres` | Use after Supabase Postgres is reachable. Run `npm run migrate` then `npm run seed`. |

### Supabase Postgres

Direct `db.<project>.supabase.co:5432` may fail on networks without IPv6. Prefer the **pooler** URL (IPv4), region for this project is typically `ap-southeast-1`:

```
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
DB_MODE=postgres
```

Also set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose to the browser)
- `STORAGE_BUCKET=cms-media` (create a public bucket in Supabase Storage)

Then:

```bash
npm run migrate
npm run seed
```

> **Note:** Runtime services currently use the file store (`DB_MODE=file`). SQL migrations + `npm run seed` prepare Supabase schema/data. After the pooler password works, switch the data layer to Postgres or keep file mode and treat Supabase Storage for media only.

## Main routes

- `GET /api/health`
- `GET /api/public/site` — published content only
- `POST /api/auth/login` | `logout` | `GET /me`
- `GET /api/admin/content` — drafts (auth)
- Admin CRUD under `/api/admin/*`
- `POST /api/admin/publish` `{ "section": "all" | "settings" | ... }` → persists published + calls Next revalidate

## Publish → ISR

On publish, the API `POST`s to `NEXT_REVALIDATE_URL` with header `x-revalidate-secret: REVALIDATE_SECRET` and body `{ "tags": ["cms","cms-home"] }`.

Frontend route: `POST /api/revalidate` (must share the same secret).
