import { loadStore, saveStore, newId } from "../db/file-store.js";
import { AppError } from "../middleware/errorHandler.js";
import { triggerRevalidate } from "./revalidate.service.js";

const SECTIONS = [
  "all",
  "settings",
  "locales",
  "services",
  "gallery",
  "testimonials",
  "hours",
];

export const publishSection = async (section, adminId) => {
  if (!SECTIONS.includes(section)) {
    throw new AppError(`Invalid section: ${section}`, 400);
  }

  const store = loadStore();

  if (section === "all" || section === "settings") {
    store.site_settings.published_json = structuredClone(
      store.site_settings.draft_json,
    );
    store.site_settings.updated_at = new Date().toISOString();
  }

  if (section === "all" || section === "locales") {
    for (const locale of Object.keys(store.locale_copy)) {
      store.locale_copy[locale].published_json = structuredClone(
        store.locale_copy[locale].draft_json,
      );
      store.locale_copy[locale].updated_at = new Date().toISOString();
    }
  }

  if (section === "all" || section === "services") {
    for (const cat of store.service_categories) {
      cat.is_visible = cat.draft_is_visible;
      cat.name_en = cat.draft_name_en;
      cat.name_ar = cat.draft_name_ar;
    }
    for (const item of store.service_items) {
      item.price = item.draft_price;
      item.currency = item.draft_currency;
      item.sort_order = item.draft_sort_order;
      item.is_visible = item.draft_is_visible;
      item.name_en = item.draft_name_en;
      item.name_ar = item.draft_name_ar;
    }
  }

  if (section === "all" || section === "gallery") {
    for (const item of store.gallery_items) {
      item.media_url = item.draft_media_url || item.media_url;
      item.kind = item.draft_kind;
      item.alt_en = item.draft_alt_en;
      item.alt_ar = item.draft_alt_ar;
      item.sort_order = item.draft_sort_order;
      item.is_visible = item.draft_is_visible;
      item.is_published = true;
    }
  }

  if (section === "all" || section === "testimonials") {
    for (const item of store.testimonials) {
      item.name = item.draft_name;
      item.quote_en = item.draft_quote_en;
      item.quote_ar = item.draft_quote_ar;
      item.source = item.draft_source;
      item.sort_order = item.draft_sort_order;
      item.is_visible = item.draft_is_visible;
      item.is_published = true;
    }
  }

  if (section === "all" || section === "hours") {
    for (const row of store.opening_hours) {
      row.is_closed = row.draft_is_closed;
      row.opens = row.draft_opens;
      row.closes = row.draft_closes;
      row.display_override = row.draft_display_override;
    }
  }

  store.publish_log.unshift({
    id: newId(),
    section,
    admin_id: adminId,
    created_at: new Date().toISOString(),
  });
  store.publish_log = store.publish_log.slice(0, 100);

  saveStore(store);

  const revalidate = await triggerRevalidate(["cms", "cms-home"]);
  return { published: section, revalidate };
};

export const getPublishLog = async (limit = 20) => {
  const store = loadStore();
  return store.publish_log.slice(0, limit).map((pl) => {
    const admin = store.admins.find((a) => a.id === pl.admin_id);
    return {
      ...pl,
      admin_email: admin?.email || null,
    };
  });
};
