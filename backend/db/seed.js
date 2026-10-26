import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];

const readJson = (name) =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, "seed-data", name), "utf8"),
  );

const run = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const siteConfig = readJson("site-config.json");
  const en = readJson("en.json");
  const ar = readJson("ar.json");

  const settings = {
    logoSrc: siteConfig.logoSrc,
    bookingUrl: siteConfig.bookingUrl,
    phoneTel: siteConfig.phoneTel,
    phoneDisplay: siteConfig.phoneDisplay,
    email: "",
    whatsappUrl: siteConfig.whatsappUrl,
    instagramUrl: siteConfig.instagramUrl,
    developerUrl: siteConfig.developerUrl,
    googleReviewsUrl: siteConfig.googleReviewsUrl,
    mapsSearchUrl: siteConfig.mapsSearchUrl,
    mapsEmbedUrl: siteConfig.mapsEmbedUrl,
    address: siteConfig.address,
    currency: "BD",
    siteUrl: "https://www.thebutlerbarber.com",
    themeColor: "#1C1C1B",
    supportedLocales: ["en", "ar"],
    seoKeywords: [
      "barber Manama",
      "barbershop Gudaibiya",
      "haircut Bahrain",
      "skin fade Manama",
      "beard trim Bahrain",
      "The Butler Barber",
      "men's grooming Manama",
      "fade haircut Gudaibiya",
      "barber near me Manama",
    ],
    images: {
      hero: siteConfig.images.hero,
      story: siteConfig.images.story,
      cta: siteConfig.images.cta,
    },
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const email = process.env.ADMIN_EMAIL || "owner@thebutlerbarber.com";
    const password = process.env.ADMIN_PASSWORD || "ChangeMeNow123!";
    const hash = await bcrypt.hash(password, 12);

    await client.query(
      `INSERT INTO admins (email, password_hash, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [email, hash, "Owner"],
    );

    await client.query(
      `INSERT INTO site_settings (id, draft_json, published_json)
       VALUES (1, $1::jsonb, $1::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         draft_json = EXCLUDED.draft_json,
         published_json = EXCLUDED.published_json,
         updated_at = NOW()`,
      [JSON.stringify(settings)],
    );

    for (const [locale, dict] of [
      ["en", en],
      ["ar", ar],
    ]) {
      await client.query(
        `INSERT INTO locale_copy (locale, draft_json, published_json)
         VALUES ($1, $2::jsonb, $2::jsonb)
         ON CONFLICT (locale) DO UPDATE SET
           draft_json = EXCLUDED.draft_json,
           published_json = EXCLUDED.published_json,
           updated_at = NOW()`,
        [locale, JSON.stringify(dict)],
      );
    }

    await client.query("DELETE FROM service_items");
    await client.query("DELETE FROM service_categories");

    let catOrder = 0;
    for (const category of siteConfig.serviceMenu) {
      const nameEn = en.services.categories[category.id] || category.id;
      const nameAr = ar.services.categories[category.id] || category.id;
      const { rows: catRows } = await client.query(
        `INSERT INTO service_categories (
           slug, sort_order, is_visible, draft_is_visible,
           name_en, name_ar, draft_name_en, draft_name_ar
         ) VALUES ($1, $2, TRUE, TRUE, $3, $4, $3, $4)
         RETURNING id`,
        [category.id, catOrder++, nameEn, nameAr],
      );
      const categoryId = catRows[0].id;

      let itemOrder = 0;
      for (const item of category.items) {
        const itemNameEn = en.services.items[item.id] || item.id;
        const itemNameAr = ar.services.items[item.id] || item.id;
        await client.query(
          `INSERT INTO service_items (
             category_id, slug, price, currency, sort_order, is_visible,
             draft_price, draft_currency, draft_sort_order, draft_is_visible,
             name_en, name_ar, draft_name_en, draft_name_ar
           ) VALUES ($1,$2,$3,'BD',$4,TRUE,$3,'BD',$4,TRUE,$5,$6,$5,$6)`,
          [
            categoryId,
            item.id,
            item.price,
            itemOrder++,
            itemNameEn,
            itemNameAr,
          ],
        );
      }
    }

    await client.query("DELETE FROM gallery_items");
    let gOrder = 0;
    for (const media of siteConfig.images.gallery) {
      const altEn = media.alt || "";
      const altAr = ar.gallery.captions[gOrder] || altEn;
      await client.query(
        `INSERT INTO gallery_items (
           media_url, kind, alt_en, alt_ar, sort_order, is_visible,
           draft_media_url, draft_kind, draft_alt_en, draft_alt_ar,
           draft_sort_order, draft_is_visible, is_published
         ) VALUES ($1,$2,$3,$4,$5,TRUE,$1,$2,$3,$4,$5,TRUE,TRUE)`,
        [media.src, media.kind, altEn, altAr, gOrder++],
      );
    }

    await client.query("DELETE FROM testimonials");
    let tOrder = 0;
    for (const review of siteConfig.reviews) {
      await client.query(
        `INSERT INTO testimonials (
           name, quote_en, quote_ar, source, sort_order, is_visible,
           draft_name, draft_quote_en, draft_quote_ar, draft_source,
           draft_sort_order, draft_is_visible, is_published
         ) VALUES ($1,$2,$2,$3,$4,TRUE,$1,$2,$2,$3,$4,TRUE,TRUE)`,
        [review.name, review.quote, review.source, tOrder++],
      );
    }

    await client.query("DELETE FROM team_members");
    let teamOrder = 0;
    for (const member of siteConfig.team || []) {
      const copyEn = en.team?.members?.[member.id] || {};
      const copyAr = ar.team?.members?.[member.id] || {};
      await client.query(
        `INSERT INTO team_members (
           slug, media_url, kind, name, role_en, role_ar, bio_en, bio_ar,
           alt_en, alt_ar, sort_order, is_visible,
           draft_media_url, draft_kind, draft_name, draft_role_en, draft_role_ar,
           draft_bio_en, draft_bio_ar, draft_alt_en, draft_alt_ar,
           draft_sort_order, draft_is_visible, is_published
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,TRUE,
           $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,TRUE,TRUE
         )`,
        [
          member.id,
          member.src,
          member.kind || "image",
          copyEn.name || member.id,
          copyEn.role || "",
          copyAr.role || copyEn.role || "",
          copyEn.bio || "",
          copyAr.bio || copyEn.bio || "",
          member.alt || copyEn.name || "",
          member.alt || copyAr.name || copyEn.name || "",
          teamOrder++,
        ],
      );
    }

    for (const day of DAYS) {
      await client.query(
        `INSERT INTO opening_hours (
           day, is_closed, opens, closes, display_override,
           draft_is_closed, draft_opens, draft_closes, draft_display_override
         ) VALUES ($1, FALSE, $2, $3, $4, FALSE, $2, $3, $4)
         ON CONFLICT (day) DO UPDATE SET
           is_closed = EXCLUDED.is_closed,
           opens = EXCLUDED.opens,
           closes = EXCLUDED.closes,
           display_override = EXCLUDED.display_override,
           draft_is_closed = EXCLUDED.draft_is_closed,
           draft_opens = EXCLUDED.draft_opens,
           draft_closes = EXCLUDED.draft_closes,
           draft_display_override = EXCLUDED.draft_display_override,
           updated_at = NOW()`,
        [
          day,
          siteConfig.hours.opens,
          siteConfig.hours.closes,
          siteConfig.hours.display,
        ],
      );
    }

    await client.query("COMMIT");
    console.log(`Seed complete. Admin: ${email}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
