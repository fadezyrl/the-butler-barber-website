import { loadStore, saveStore, newId } from "../db/file-store.js";
import { AppError } from "../middleware/errorHandler.js";

export const upsertServiceCategory = async (data) => {
  const store = loadStore();
  if (data.id) {
    const cat = store.service_categories.find((c) => c.id === data.id);
    if (!cat) throw new AppError("Category not found", 404);
    if (data.slug !== undefined) cat.slug = data.slug;
    if (data.sortOrder !== undefined) cat.sort_order = data.sortOrder;
    if (data.isVisible !== undefined) cat.draft_is_visible = data.isVisible;
    if (data.nameEn !== undefined) cat.draft_name_en = data.nameEn;
    if (data.nameAr !== undefined) cat.draft_name_ar = data.nameAr;
    saveStore(store);
    return cat;
  }

  const cat = {
    id: newId(),
    slug: data.slug,
    sort_order: data.sortOrder ?? 0,
    is_visible: data.isVisible ?? true,
    draft_is_visible: data.isVisible ?? true,
    name_en: data.nameEn || "",
    name_ar: data.nameAr || "",
    draft_name_en: data.nameEn || "",
    draft_name_ar: data.nameAr || "",
  };
  store.service_categories.push(cat);
  saveStore(store);
  return cat;
};

export const deleteServiceCategory = async (id) => {
  const store = loadStore();
  const before = store.service_categories.length;
  store.service_categories = store.service_categories.filter((c) => c.id !== id);
  store.service_items = store.service_items.filter((i) => i.category_id !== id);
  if (store.service_categories.length === before) {
    throw new AppError("Category not found", 404);
  }
  saveStore(store);
  return { deleted: true };
};

export const upsertServiceItem = async (data) => {
  const store = loadStore();
  if (data.id) {
    const item = store.service_items.find((i) => i.id === data.id);
    if (!item) throw new AppError("Service item not found", 404);
    if (data.categoryId !== undefined) item.category_id = data.categoryId;
    if (data.slug !== undefined) item.slug = data.slug;
    if (data.price !== undefined) item.draft_price = data.price;
    if (data.currency !== undefined) item.draft_currency = data.currency;
    if (data.sortOrder !== undefined) item.draft_sort_order = data.sortOrder;
    if (data.isVisible !== undefined) item.draft_is_visible = data.isVisible;
    if (data.nameEn !== undefined) item.draft_name_en = data.nameEn;
    if (data.nameAr !== undefined) item.draft_name_ar = data.nameAr;
    saveStore(store);
    return item;
  }

  const item = {
    id: newId(),
    category_id: data.categoryId,
    slug: data.slug,
    price: data.price || "",
    currency: data.currency || "BD",
    sort_order: data.sortOrder ?? 0,
    is_visible: data.isVisible ?? true,
    draft_price: data.price || "",
    draft_currency: data.currency || "BD",
    draft_sort_order: data.sortOrder ?? 0,
    draft_is_visible: data.isVisible ?? true,
    name_en: data.nameEn || "",
    name_ar: data.nameAr || "",
    draft_name_en: data.nameEn || "",
    draft_name_ar: data.nameAr || "",
  };
  store.service_items.push(item);
  saveStore(store);
  return item;
};

export const deleteServiceItem = async (id) => {
  const store = loadStore();
  const before = store.service_items.length;
  store.service_items = store.service_items.filter((i) => i.id !== id);
  if (store.service_items.length === before) {
    throw new AppError("Service item not found", 404);
  }
  saveStore(store);
  return { deleted: true };
};

export const reorderServiceItems = async (orderedIds) => {
  const store = loadStore();
  orderedIds.forEach((id, i) => {
    const item = store.service_items.find((x) => x.id === id);
    if (item) item.draft_sort_order = i;
  });
  saveStore(store);
  return { reordered: true };
};

export const upsertGalleryItem = async (data) => {
  const store = loadStore();
  if (data.id) {
    const item = store.gallery_items.find((g) => g.id === data.id);
    if (!item) throw new AppError("Gallery item not found", 404);
    if (data.mediaUrl !== undefined) item.draft_media_url = data.mediaUrl;
    if (data.kind !== undefined) item.draft_kind = data.kind;
    if (data.altEn !== undefined) item.draft_alt_en = data.altEn;
    if (data.altAr !== undefined) item.draft_alt_ar = data.altAr;
    if (data.sortOrder !== undefined) item.draft_sort_order = data.sortOrder;
    if (data.isVisible !== undefined) item.draft_is_visible = data.isVisible;
    saveStore(store);
    return item;
  }

  const item = {
    id: newId(),
    media_url: data.mediaUrl,
    draft_media_url: data.mediaUrl,
    kind: data.kind || "image",
    draft_kind: data.kind || "image",
    alt_en: data.altEn || "",
    draft_alt_en: data.altEn || "",
    alt_ar: data.altAr || "",
    draft_alt_ar: data.altAr || "",
    sort_order: data.sortOrder ?? 0,
    draft_sort_order: data.sortOrder ?? 0,
    is_visible: data.isVisible ?? true,
    draft_is_visible: data.isVisible ?? true,
    is_published: false,
  };
  store.gallery_items.push(item);
  saveStore(store);
  return item;
};

export const deleteGalleryItem = async (id) => {
  const store = loadStore();
  const before = store.gallery_items.length;
  store.gallery_items = store.gallery_items.filter((g) => g.id !== id);
  if (store.gallery_items.length === before) {
    throw new AppError("Gallery item not found", 404);
  }
  saveStore(store);
  return { deleted: true };
};

export const reorderGallery = async (orderedIds) => {
  const store = loadStore();
  orderedIds.forEach((id, i) => {
    const item = store.gallery_items.find((x) => x.id === id);
    if (item) item.draft_sort_order = i;
  });
  saveStore(store);
  return { reordered: true };
};

export const upsertTestimonial = async (data) => {
  const store = loadStore();
  if (data.id) {
    const item = store.testimonials.find((t) => t.id === data.id);
    if (!item) throw new AppError("Testimonial not found", 404);
    if (data.name !== undefined) item.draft_name = data.name;
    if (data.quoteEn !== undefined) item.draft_quote_en = data.quoteEn;
    if (data.quoteAr !== undefined) item.draft_quote_ar = data.quoteAr;
    if (data.source !== undefined) item.draft_source = data.source;
    if (data.sortOrder !== undefined) item.draft_sort_order = data.sortOrder;
    if (data.isVisible !== undefined) item.draft_is_visible = data.isVisible;
    saveStore(store);
    return item;
  }

  const item = {
    id: newId(),
    name: data.name || "",
    draft_name: data.name || "",
    quote_en: data.quoteEn || "",
    draft_quote_en: data.quoteEn || "",
    quote_ar: data.quoteAr || "",
    draft_quote_ar: data.quoteAr || "",
    source: data.source || "",
    draft_source: data.source || "",
    sort_order: data.sortOrder ?? 0,
    draft_sort_order: data.sortOrder ?? 0,
    is_visible: data.isVisible ?? true,
    draft_is_visible: data.isVisible ?? true,
    is_published: false,
  };
  store.testimonials.push(item);
  saveStore(store);
  return item;
};

export const deleteTestimonial = async (id) => {
  const store = loadStore();
  const before = store.testimonials.length;
  store.testimonials = store.testimonials.filter((t) => t.id !== id);
  if (store.testimonials.length === before) {
    throw new AppError("Testimonial not found", 404);
  }
  saveStore(store);
  return { deleted: true };
};

export const reorderTestimonials = async (orderedIds) => {
  const store = loadStore();
  orderedIds.forEach((id, i) => {
    const item = store.testimonials.find((x) => x.id === id);
    if (item) item.draft_sort_order = i;
  });
  saveStore(store);
  return { reordered: true };
};

const slugifyTeam = (value) => {
  const parts = String(value || "member")
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (!parts.length) return `member${Date.now()}`;
  return (
    parts[0] +
    parts
      .slice(1)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")
  );
};

export const upsertTeamMember = async (data) => {
  const store = loadStore();
  if (!Array.isArray(store.team_members)) store.team_members = [];

  if (data.id) {
    const item = store.team_members.find((t) => t.id === data.id);
    if (!item) throw new AppError("Team member not found", 404);
    if (data.slug !== undefined) item.slug = data.slug;
    if (data.mediaUrl !== undefined) item.draft_media_url = data.mediaUrl;
    if (data.kind !== undefined) item.draft_kind = data.kind;
    if (data.name !== undefined) item.draft_name = data.name;
    if (data.roleEn !== undefined) item.draft_role_en = data.roleEn;
    if (data.roleAr !== undefined) item.draft_role_ar = data.roleAr;
    if (data.bioEn !== undefined) item.draft_bio_en = data.bioEn;
    if (data.bioAr !== undefined) item.draft_bio_ar = data.bioAr;
    if (data.altEn !== undefined) item.draft_alt_en = data.altEn;
    if (data.altAr !== undefined) item.draft_alt_ar = data.altAr;
    if (data.sortOrder !== undefined) item.draft_sort_order = data.sortOrder;
    if (data.isVisible !== undefined) item.draft_is_visible = data.isVisible;
    saveStore(store);
    return item;
  }

  let slug =
    data.slug ||
    slugifyTeam(data.name) ||
    `member${store.team_members.length + 1}`;
  if (store.team_members.some((t) => t.slug === slug)) {
    if (data.slug) {
      throw new AppError("Team member slug already exists", 409);
    }
    let n = 2;
    while (store.team_members.some((t) => t.slug === `${slug}${n}`)) n += 1;
    slug = `${slug}${n}`;
  }

  const item = {
    id: newId(),
    slug,
    media_url: data.mediaUrl || "",
    draft_media_url: data.mediaUrl || "",
    kind: data.kind || "image",
    draft_kind: data.kind || "image",
    name: data.name || "",
    draft_name: data.name || "",
    role_en: data.roleEn || "",
    draft_role_en: data.roleEn || "",
    role_ar: data.roleAr || "",
    draft_role_ar: data.roleAr || "",
    bio_en: data.bioEn || "",
    draft_bio_en: data.bioEn || "",
    bio_ar: data.bioAr || "",
    draft_bio_ar: data.bioAr || "",
    alt_en: data.altEn || data.name || "",
    draft_alt_en: data.altEn || data.name || "",
    alt_ar: data.altAr || data.name || "",
    draft_alt_ar: data.altAr || data.name || "",
    sort_order: data.sortOrder ?? store.team_members.length,
    draft_sort_order: data.sortOrder ?? store.team_members.length,
    is_visible: data.isVisible ?? true,
    draft_is_visible: data.isVisible ?? true,
    is_published: false,
  };
  store.team_members.push(item);
  saveStore(store);
  return item;
};

export const deleteTeamMember = async (id) => {
  const store = loadStore();
  if (!Array.isArray(store.team_members)) store.team_members = [];
  const before = store.team_members.length;
  store.team_members = store.team_members.filter((t) => t.id !== id);
  if (store.team_members.length === before) {
    throw new AppError("Team member not found", 404);
  }
  saveStore(store);
  return { deleted: true };
};

export const reorderTeamMembers = async (orderedIds) => {
  const store = loadStore();
  if (!Array.isArray(store.team_members)) store.team_members = [];
  orderedIds.forEach((id, i) => {
    const item = store.team_members.find((x) => x.id === id);
    if (item) item.draft_sort_order = i;
  });
  saveStore(store);
  return { reordered: true };
};
