import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { resetStore, newId } from "../src/db/file-store.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];

const readJson = (name) =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, "seed-data", name), "utf8"),
  );

const run = async () => {
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

  const email = (process.env.ADMIN_EMAIL || "owner@thebutlerbarber.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMeNow123!";
  const hash = await bcrypt.hash(password, 12);

  const service_categories = [];
  const service_items = [];
  let catOrder = 0;
  for (const category of siteConfig.serviceMenu) {
    const catId = newId();
    const nameEn = en.services.categories[category.id] || category.id;
    const nameAr = ar.services.categories[category.id] || category.id;
    service_categories.push({
      id: catId,
      slug: category.id,
      sort_order: catOrder++,
      is_visible: true,
      draft_is_visible: true,
      name_en: nameEn,
      name_ar: nameAr,
      draft_name_en: nameEn,
      draft_name_ar: nameAr,
    });
    let itemOrder = 0;
    for (const item of category.items) {
      const itemNameEn = en.services.items[item.id] || item.id;
      const itemNameAr = ar.services.items[item.id] || item.id;
      service_items.push({
        id: newId(),
        category_id: catId,
        slug: item.id,
        price: item.price,
        currency: "BD",
        sort_order: itemOrder,
        is_visible: true,
        draft_price: item.price,
        draft_currency: "BD",
        draft_sort_order: itemOrder,
        draft_is_visible: true,
        name_en: itemNameEn,
        name_ar: itemNameAr,
        draft_name_en: itemNameEn,
        draft_name_ar: itemNameAr,
      });
      itemOrder += 1;
    }
  }

  let gOrder = 0;
  const gallery_items = siteConfig.images.gallery.map((media) => {
    const altEn = media.alt || "";
    const altAr = ar.gallery.captions[gOrder] || altEn;
    const row = {
      id: newId(),
      media_url: media.src,
      kind: media.kind,
      alt_en: altEn,
      alt_ar: altAr,
      sort_order: gOrder,
      is_visible: true,
      draft_media_url: media.src,
      draft_kind: media.kind,
      draft_alt_en: altEn,
      draft_alt_ar: altAr,
      draft_sort_order: gOrder,
      draft_is_visible: true,
      is_published: true,
    };
    gOrder += 1;
    return row;
  });

  let tOrder = 0;
  const testimonials = siteConfig.reviews.map((review) => {
    const row = {
      id: newId(),
      name: review.name,
      quote_en: review.quote,
      quote_ar: review.quote,
      source: review.source,
      sort_order: tOrder,
      is_visible: true,
      draft_name: review.name,
      draft_quote_en: review.quote,
      draft_quote_ar: review.quote,
      draft_source: review.source,
      draft_sort_order: tOrder,
      draft_is_visible: true,
      is_published: true,
    };
    tOrder += 1;
    return row;
  });

  let teamOrder = 0;
  const team_members = (siteConfig.team || []).map((member) => {
    const copyEn = en.team?.members?.[member.id] || {};
    const copyAr = ar.team?.members?.[member.id] || {};
    const row = {
      id: newId(),
      slug: member.id,
      media_url: member.src,
      kind: member.kind || "image",
      name: copyEn.name || member.id,
      role_en: copyEn.role || "",
      role_ar: copyAr.role || copyEn.role || "",
      bio_en: copyEn.bio || "",
      bio_ar: copyAr.bio || copyEn.bio || "",
      alt_en: member.alt || copyEn.name || "",
      alt_ar: member.alt || copyAr.name || copyEn.name || "",
      sort_order: teamOrder,
      is_visible: true,
      draft_media_url: member.src,
      draft_kind: member.kind || "image",
      draft_name: copyEn.name || member.id,
      draft_role_en: copyEn.role || "",
      draft_role_ar: copyAr.role || copyEn.role || "",
      draft_bio_en: copyEn.bio || "",
      draft_bio_ar: copyAr.bio || copyEn.bio || "",
      draft_alt_en: member.alt || copyEn.name || "",
      draft_alt_ar: member.alt || copyAr.name || copyEn.name || "",
      draft_sort_order: teamOrder,
      draft_is_visible: true,
      is_published: true,
    };
    teamOrder += 1;
    return row;
  });

  const opening_hours = DAYS.map((day) => ({
    day,
    is_closed: false,
    opens: siteConfig.hours.opens,
    closes: siteConfig.hours.closes,
    display_override: siteConfig.hours.display,
    draft_is_closed: false,
    draft_opens: siteConfig.hours.opens,
    draft_closes: siteConfig.hours.closes,
    draft_display_override: siteConfig.hours.display,
  }));

  resetStore({
    admins: [
      {
        id: newId(),
        email,
        password_hash: hash,
        name: "Owner",
        created_at: new Date().toISOString(),
      },
    ],
    site_settings: {
      id: 1,
      draft_json: settings,
      published_json: settings,
      updated_at: new Date().toISOString(),
    },
    locale_copy: {
      en: {
        locale: "en",
        draft_json: en,
        published_json: en,
        updated_at: new Date().toISOString(),
      },
      ar: {
        locale: "ar",
        draft_json: ar,
        published_json: ar,
        updated_at: new Date().toISOString(),
      },
    },
    service_categories,
    service_items,
    gallery_items,
    testimonials,
    team_members,
    opening_hours,
    media_assets: [],
    publish_log: [],
  });

  console.log(`File store seeded. Admin: ${email}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
