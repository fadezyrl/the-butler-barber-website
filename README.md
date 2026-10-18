# The Butler Barber — Website + CMS

Public site (Next.js) and admin CMS that edits navbar → footer content with draft/publish and ISR revalidation.

## Structure

- `frontend/` — Next.js App Router public site + `/admin` dashboard
- `backend/` — Express CMS API

## Local development

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed:file
npm run dev
```

Runs on [http://localhost:4000](http://localhost:4000).

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Default admin (change immediately):

- `owner@thebutlerbarber.com` / `ChangeMeNow123!`

Ensure `REVALIDATE_SECRET` matches in both `.env` files.

## How publishing works

1. Owner edits drafts in `/admin`
2. **Publish** writes published content and calls `POST /api/revalidate`
3. Next.js invalidates cache tags `cms` / `cms-home`
4. Visitors see updated content without redeploying

## Supabase

1. Reset/confirm the database password in the Supabase dashboard
2. Use the **pooler** connection string (IPv4) in `backend/.env`
3. Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
4. Create public Storage bucket `cms-media`
5. `npm run migrate && npm run seed` then set `DB_MODE=postgres`

Until Postgres is reachable, `DB_MODE=file` stores CMS data in `backend/data/cms-store.json` and serves uploads from `backend/uploads/`.

## Admin screens

Overview · Settings (brand/contact/SEO) · Hero & Story · Services · Gallery · Testimonials · Hours · Locales (EN/AR) · Media · Publish
