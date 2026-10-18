import { loadStore, saveStore } from "../db/file-store.js";
import { AppError } from "../middleware/errorHandler.js";

const DAY_KEYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];
const DAY_UI = {
  sat: "Sat",
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
};

const formatDisplay = (row, draft = false) => {
  const closed = draft ? row.draft_is_closed : row.is_closed;
  const opens = draft ? row.draft_opens : row.opens;
  const closes = draft ? row.draft_closes : row.closes;
  const override = draft ? row.draft_display_override : row.display_override;
  if (closed) return "Closed";
  if (override) return override;
  return `${opens} – ${closes}`;
};

const buildHoursPayload = (rows, draft = false) =>
  DAY_KEYS.map((day) => {
    const row = rows.find((r) => r.day === day);
    if (!row) {
      return {
        day,
        dayKey: DAY_UI[day],
        isClosed: false,
        opens: "09:00",
        closes: "23:30",
        display: "09:00 – 23:30",
      };
    }
    return {
      day,
      dayKey: DAY_UI[day],
      isClosed: draft ? row.draft_is_closed : row.is_closed,
      opens: draft ? row.draft_opens : row.opens,
      closes: draft ? row.draft_closes : row.closes,
      displayOverride: draft
        ? row.draft_display_override
        : row.display_override,
      display: formatDisplay(row, draft),
    };
  });

const buildServices = (categories, items, draft = false) =>
  categories
    .map((cat) => {
      const catItems = items
        .filter((i) => i.category_id === cat.id)
        .sort(
          (a, b) =>
            (draft ? a.draft_sort_order : a.sort_order) -
            (draft ? b.draft_sort_order : b.sort_order),
        )
        .filter((i) => (draft ? i.draft_is_visible : i.is_visible))
        .map((i) => ({
          id: i.id,
          slug: i.slug,
          price: draft ? i.draft_price : i.price,
          currency: draft ? i.draft_currency : i.currency,
          sortOrder: draft ? i.draft_sort_order : i.sort_order,
          isVisible: draft ? i.draft_is_visible : i.is_visible,
          nameEn: draft ? i.draft_name_en : i.name_en,
          nameAr: draft ? i.draft_name_ar : i.name_ar,
        }));

      return {
        id: cat.id,
        slug: cat.slug,
        sortOrder: cat.sort_order,
        isVisible: draft ? cat.draft_is_visible : cat.is_visible,
        nameEn: draft ? cat.draft_name_en : cat.name_en,
        nameAr: draft ? cat.draft_name_ar : cat.name_ar,
        items: catItems,
      };
    })
    .filter((c) => c.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

const buildGallery = (rows, draft = false) =>
  rows
    .filter((r) => {
      if (draft) return r.draft_is_visible;
      return r.is_published && r.is_visible;
    })
    .sort(
      (a, b) =>
        (draft ? a.draft_sort_order : a.sort_order) -
        (draft ? b.draft_sort_order : b.sort_order),
    )
    .map((r) => ({
      id: r.id,
      src: draft ? r.draft_media_url || r.media_url : r.media_url,
      kind: draft ? r.draft_kind : r.kind,
      altEn: draft ? r.draft_alt_en : r.alt_en,
      altAr: draft ? r.draft_alt_ar : r.alt_ar,
      sortOrder: draft ? r.draft_sort_order : r.sort_order,
      isVisible: draft ? r.draft_is_visible : r.is_visible,
      isPublished: r.is_published,
    }));

const buildTestimonials = (rows, draft = false) =>
  rows
    .filter((r) => {
      if (draft) return r.draft_is_visible;
      return r.is_published && r.is_visible;
    })
    .sort(
      (a, b) =>
        (draft ? a.draft_sort_order : a.sort_order) -
        (draft ? b.draft_sort_order : b.sort_order),
    )
    .map((r) => ({
      id: r.id,
      name: draft ? r.draft_name : r.name,
      quoteEn: draft ? r.draft_quote_en : r.quote_en,
      quoteAr: draft ? r.draft_quote_ar : r.quote_ar,
      source: draft ? r.draft_source : r.source,
      sortOrder: draft ? r.draft_sort_order : r.sort_order,
      isVisible: draft ? r.draft_is_visible : r.is_visible,
      isPublished: r.is_published,
    }));

const mergeServiceNamesIntoDictionary = (dict, services, locale) => {
  const next = structuredClone(dict);
  if (!next.services) next.services = {};
  next.services.categories = { ...(next.services.categories || {}) };
  next.services.items = { ...(next.services.items || {}) };
  for (const cat of services) {
    next.services.categories[cat.slug] =
      locale === "ar" ? cat.nameAr : cat.nameEn;
    for (const item of cat.items) {
      next.services.items[item.slug] =
        locale === "ar" ? item.nameAr : item.nameEn;
    }
  }
  return next;
};

export const getPublishedSite = async () => {
  const store = loadStore();
  if (!store.site_settings) {
    throw new AppError("Site settings not seeded. Run npm run seed:file", 503);
  }

  const settings = store.site_settings.published_json;
  const services = buildServices(
    store.service_categories,
    store.service_items,
    false,
  );
  const gallery = buildGallery(store.gallery_items, false);
  const testimonials = buildTestimonials(store.testimonials, false);
  const hours = buildHoursPayload(store.opening_hours, false);

  const dictionaries = {};
  for (const locale of Object.keys(store.locale_copy)) {
    const row = store.locale_copy[locale];
    let dict = mergeServiceNamesIntoDictionary(
      row.published_json,
      services,
      locale,
    );
    dict = {
      ...dict,
      gallery: {
        ...dict.gallery,
        captions: gallery.map((g) =>
          locale === "ar" ? g.altAr || g.altEn : g.altEn,
        ),
      },
    };
    dictionaries[locale] = dict;
  }

  const legacyServiceMenu = services.map((cat) => ({
    id: cat.slug,
    items: cat.items.map((i) => ({
      id: i.slug,
      price: i.price,
    })),
  }));

  const reviews = testimonials.map((t) => ({
    quote: t.quoteEn,
    quoteAr: t.quoteAr,
    name: t.name,
    source: t.source,
  }));

  return {
    settings,
    hours,
    services,
    gallery,
    testimonials,
    dictionaries,
    siteConfig: {
      ...settings,
      hours: {
        opens: hours.find((h) => !h.isClosed)?.opens || "09:00",
        closes: hours.find((h) => !h.isClosed)?.closes || "23:30",
        display:
          hours.find((h) => !h.isClosed)?.display || hours[0]?.display || "",
      },
      images: {
        ...(settings.images || {}),
        gallery: gallery.map((g) => ({
          src: g.src,
          alt: g.altEn,
          kind: g.kind,
        })),
      },
      reviews,
      serviceMenu: legacyServiceMenu,
      openingHours: hours,
    },
  };
};

export const getAdminDraftSite = async () => {
  const store = loadStore();
  return {
    settings: {
      draft: store.site_settings?.draft_json || {},
      published: store.site_settings?.published_json || {},
      updatedAt: store.site_settings?.updated_at,
    },
    locales: Object.fromEntries(
      Object.entries(store.locale_copy).map(([locale, r]) => [
        locale,
        {
          draft: r.draft_json,
          published: r.published_json,
          updatedAt: r.updated_at,
        },
      ]),
    ),
    services: {
      categories: store.service_categories,
      items: store.service_items,
    },
    gallery: store.gallery_items,
    testimonials: store.testimonials,
    hours: store.opening_hours,
    preview: {
      settings: store.site_settings?.draft_json || {},
      hours: buildHoursPayload(store.opening_hours, true),
      services: buildServices(
        store.service_categories,
        store.service_items,
        true,
      ),
      gallery: buildGallery(store.gallery_items, true),
      testimonials: buildTestimonials(store.testimonials, true),
    },
  };
};

export const updateSettingsDraft = async (payload) => {
  const store = loadStore();
  if (!store.site_settings) throw new AppError("Settings not found", 404);
  store.site_settings.draft_json = payload;
  store.site_settings.updated_at = new Date().toISOString();
  saveStore(store);
  return {
    draft_json: store.site_settings.draft_json,
    updated_at: store.site_settings.updated_at,
  };
};

export const updateLocaleDraft = async (locale, payload) => {
  if (!["en", "ar"].includes(locale)) {
    throw new AppError("Invalid locale", 400);
  }
  const store = loadStore();
  if (!store.locale_copy[locale]) throw new AppError("Locale not found", 404);
  store.locale_copy[locale].draft_json = payload;
  store.locale_copy[locale].updated_at = new Date().toISOString();
  saveStore(store);
  return {
    locale,
    draft_json: store.locale_copy[locale].draft_json,
    updated_at: store.locale_copy[locale].updated_at,
  };
};

export const upsertHoursDraft = async (days) => {
  const store = loadStore();
  for (const day of days) {
    const row = store.opening_hours.find((h) => h.day === day.day);
    if (!row) continue;
    row.draft_is_closed = day.isClosed;
    row.draft_opens = day.opens;
    row.draft_closes = day.closes;
    row.draft_display_override = day.displayOverride ?? null;
  }
  saveStore(store);
  return store.opening_hours;
};
