import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

let pool = null;
let cache = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_URL.includes("supabase")
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return pool;
};

export const loadStoreFromPg = async () => {
  if (cache) return cache;
  const client = await getPool().connect();
  try {
    const [
      admins,
      settings,
      locales,
      cats,
      items,
      gallery,
      testimonials,
      team,
      hours,
      media,
      log,
    ] = await Promise.all([
      client.query("SELECT * FROM admins"),
      client.query("SELECT * FROM site_settings WHERE id = 1"),
      client.query("SELECT * FROM locale_copy"),
      client.query("SELECT * FROM service_categories ORDER BY sort_order"),
      client.query("SELECT * FROM service_items ORDER BY sort_order"),
      client.query("SELECT * FROM gallery_items ORDER BY sort_order"),
      client.query("SELECT * FROM testimonials ORDER BY sort_order"),
      client.query("SELECT * FROM team_members ORDER BY sort_order"),
      client.query("SELECT * FROM opening_hours"),
      client.query("SELECT * FROM media_assets ORDER BY created_at DESC"),
      client.query(
        "SELECT * FROM publish_log ORDER BY created_at DESC LIMIT 100",
      ),
    ]);

    const locale_copy = {};
    for (const row of locales.rows) {
      locale_copy[row.locale] = row;
    }

    cache = {
      admins: admins.rows,
      site_settings: settings.rows[0] || null,
      locale_copy,
      service_categories: cats.rows,
      service_items: items.rows,
      gallery_items: gallery.rows,
      testimonials: testimonials.rows,
      team_members: team.rows,
      opening_hours: hours.rows,
      media_assets: media.rows,
      publish_log: log.rows,
    };
    return cache;
  } finally {
    client.release();
  }
};

export const saveStoreToPg = async (store) => {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM publish_log");
    await client.query("DELETE FROM media_assets");
    await client.query("DELETE FROM service_items");
    await client.query("DELETE FROM service_categories");
    await client.query("DELETE FROM gallery_items");
    await client.query("DELETE FROM testimonials");
    await client.query("DELETE FROM team_members");
    await client.query("DELETE FROM opening_hours");
    await client.query("DELETE FROM locale_copy");
    await client.query("DELETE FROM site_settings");
    await client.query("DELETE FROM admins");

    for (const a of store.admins) {
      await client.query(
        `INSERT INTO admins (id, email, password_hash, name, created_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          a.id,
          a.email,
          a.password_hash,
          a.name,
          a.created_at || new Date().toISOString(),
        ],
      );
    }

    if (store.site_settings) {
      await client.query(
        `INSERT INTO site_settings (id, draft_json, published_json, updated_at)
         VALUES (1, $1::jsonb, $2::jsonb, $3)`,
        [
          JSON.stringify(store.site_settings.draft_json),
          JSON.stringify(store.site_settings.published_json),
          store.site_settings.updated_at || new Date().toISOString(),
        ],
      );
    }

    for (const locale of Object.keys(store.locale_copy)) {
      const row = store.locale_copy[locale];
      await client.query(
        `INSERT INTO locale_copy (locale, draft_json, published_json, updated_at)
         VALUES ($1, $2::jsonb, $3::jsonb, $4)`,
        [
          locale,
          JSON.stringify(row.draft_json),
          JSON.stringify(row.published_json),
          row.updated_at || new Date().toISOString(),
        ],
      );
    }

    for (const cat of store.service_categories) {
      await client.query(
        `INSERT INTO service_categories (
           id, slug, sort_order, is_visible, draft_is_visible,
           name_en, name_ar, draft_name_en, draft_name_ar
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          cat.id,
          cat.slug,
          cat.sort_order,
          cat.is_visible,
          cat.draft_is_visible,
          cat.name_en,
          cat.name_ar,
          cat.draft_name_en,
          cat.draft_name_ar,
        ],
      );
    }

    for (const item of store.service_items) {
      await client.query(
        `INSERT INTO service_items (
           id, category_id, slug, price, currency, sort_order, is_visible,
           draft_price, draft_currency, draft_sort_order, draft_is_visible,
           name_en, name_ar, draft_name_en, draft_name_ar
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          item.id,
          item.category_id,
          item.slug,
          item.price,
          item.currency,
          item.sort_order,
          item.is_visible,
          item.draft_price,
          item.draft_currency,
          item.draft_sort_order,
          item.draft_is_visible,
          item.name_en,
          item.name_ar,
          item.draft_name_en,
          item.draft_name_ar,
        ],
      );
    }

    for (const g of store.gallery_items) {
      await client.query(
        `INSERT INTO gallery_items (
           id, media_url, kind, alt_en, alt_ar, sort_order, is_visible,
           draft_media_url, draft_kind, draft_alt_en, draft_alt_ar,
           draft_sort_order, draft_is_visible, is_published
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          g.id,
          g.media_url,
          g.kind,
          g.alt_en,
          g.alt_ar,
          g.sort_order,
          g.is_visible,
          g.draft_media_url,
          g.draft_kind,
          g.draft_alt_en,
          g.draft_alt_ar,
          g.draft_sort_order,
          g.draft_is_visible,
          g.is_published,
        ],
      );
    }

    for (const t of store.testimonials) {
      await client.query(
        `INSERT INTO testimonials (
           id, name, quote_en, quote_ar, source, sort_order, is_visible,
           draft_name, draft_quote_en, draft_quote_ar, draft_source,
           draft_sort_order, draft_is_visible, is_published
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          t.id,
          t.name,
          t.quote_en,
          t.quote_ar,
          t.source,
          t.sort_order,
          t.is_visible,
          t.draft_name,
          t.draft_quote_en,
          t.draft_quote_ar,
          t.draft_source,
          t.draft_sort_order,
          t.draft_is_visible,
          t.is_published,
        ],
      );
    }

    for (const m of store.team_members || []) {
      await client.query(
        `INSERT INTO team_members (
           id, slug, media_url, kind, name, role_en, role_ar, bio_en, bio_ar,
           alt_en, alt_ar, sort_order, is_visible,
           draft_media_url, draft_kind, draft_name, draft_role_en, draft_role_ar,
           draft_bio_en, draft_bio_ar, draft_alt_en, draft_alt_ar,
           draft_sort_order, draft_is_visible, is_published
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
           $14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
         )`,
        [
          m.id,
          m.slug,
          m.media_url,
          m.kind,
          m.name,
          m.role_en,
          m.role_ar,
          m.bio_en,
          m.bio_ar,
          m.alt_en,
          m.alt_ar,
          m.sort_order,
          m.is_visible,
          m.draft_media_url,
          m.draft_kind,
          m.draft_name,
          m.draft_role_en,
          m.draft_role_ar,
          m.draft_bio_en,
          m.draft_bio_ar,
          m.draft_alt_en,
          m.draft_alt_ar,
          m.draft_sort_order,
          m.draft_is_visible,
          m.is_published,
        ],
      );
    }

    for (const h of store.opening_hours) {
      await client.query(
        `INSERT INTO opening_hours (
           day, is_closed, opens, closes, display_override,
           draft_is_closed, draft_opens, draft_closes, draft_display_override
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          h.day,
          h.is_closed,
          h.opens,
          h.closes,
          h.display_override,
          h.draft_is_closed,
          h.draft_opens,
          h.draft_closes,
          h.draft_display_override,
        ],
      );
    }

    for (const m of store.media_assets) {
      await client.query(
        `INSERT INTO media_assets (id, path, public_url, mime, size_bytes, alt, created_by, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          m.id,
          m.path,
          m.public_url,
          m.mime,
          m.size_bytes,
          m.alt,
          m.created_by,
          m.created_at || new Date().toISOString(),
        ],
      );
    }

    for (const pl of store.publish_log) {
      await client.query(
        `INSERT INTO publish_log (id, section, admin_id, created_at)
         VALUES ($1,$2,$3,$4)`,
        [
          pl.id,
          pl.section,
          pl.admin_id,
          pl.created_at || new Date().toISOString(),
        ],
      );
    }

    await client.query("COMMIT");
    cache = store;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const clearPgCache = () => {
  cache = null;
};

export const testPgConnection = async () => {
  const client = await getPool().connect();
  try {
    await client.query("SELECT 1");
    return true;
  } finally {
    client.release();
  }
};
