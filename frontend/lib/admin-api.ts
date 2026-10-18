import type {
  AdminDashboard,
  AdminDraftContent,
  AdminUser,
  MediaAsset,
  PublishSection,
} from "@/types/cms";

export const ADMIN_TOKEN_KEY = "butler_admin_token";

const getBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:4000";

export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAdminToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // Ignore storage failures.
  }
};

type AdminFetchOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  headers?: Record<string, string>;
};

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

export const adminFetch = async <T>(
  path: string,
  options: AdminFetchOptions = {},
): Promise<T> => {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers,
    body,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { message?: string; error?: string };
      message = data.message || data.error || message;
    } catch {
      // keep default message
    }
    throw new AdminApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
};

export const adminLogin = async (
  email: string,
  password: string,
): Promise<{ admin: AdminUser; accessToken: string }> => {
  const data = await adminFetch<{ admin: AdminUser; accessToken: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: { email, password },
    },
  );
  setAdminToken(data.accessToken);
  return data;
};

export const adminLogout = async (): Promise<void> => {
  try {
    await adminFetch("/api/auth/logout", { method: "POST" });
  } finally {
    setAdminToken(null);
  }
};

export const adminMe = (): Promise<{ admin: AdminUser }> =>
  adminFetch("/api/auth/me");

export const getDashboard = (): Promise<AdminDashboard> =>
  adminFetch("/api/admin/dashboard");

export const getAdminContent = (): Promise<AdminDraftContent> =>
  adminFetch("/api/admin/content");

export const saveSettingsDraft = (
  settings: Record<string, unknown>,
): Promise<unknown> =>
  adminFetch("/api/admin/settings", { method: "PUT", body: settings });

export const saveLocaleDraft = (
  locale: string,
  dictionary: Record<string, unknown>,
): Promise<unknown> =>
  adminFetch(`/api/admin/locales/${locale}`, {
    method: "PUT",
    body: dictionary,
  });

export const saveHoursDraft = (days: unknown[]): Promise<unknown> =>
  adminFetch("/api/admin/hours", { method: "PUT", body: { days } });

export const upsertServiceCategory = (
  payload: Record<string, unknown>,
): Promise<unknown> =>
  adminFetch("/api/admin/services/categories", {
    method: "POST",
    body: payload,
  });

export const deleteServiceCategory = (id: string): Promise<unknown> =>
  adminFetch(`/api/admin/services/categories/${id}`, { method: "DELETE" });

export const upsertServiceItem = (
  payload: Record<string, unknown>,
): Promise<unknown> =>
  adminFetch("/api/admin/services/items", { method: "POST", body: payload });

export const deleteServiceItem = (id: string): Promise<unknown> =>
  adminFetch(`/api/admin/services/items/${id}`, { method: "DELETE" });

export const reorderServiceItems = (orderedIds: string[]): Promise<unknown> =>
  adminFetch("/api/admin/services/items/reorder", {
    method: "POST",
    body: { orderedIds },
  });

export const upsertGalleryItem = (
  payload: Record<string, unknown>,
): Promise<unknown> =>
  adminFetch("/api/admin/gallery", { method: "POST", body: payload });

export const deleteGalleryItem = (id: string): Promise<unknown> =>
  adminFetch(`/api/admin/gallery/${id}`, { method: "DELETE" });

export const reorderGallery = (orderedIds: string[]): Promise<unknown> =>
  adminFetch("/api/admin/gallery/reorder", {
    method: "POST",
    body: { orderedIds },
  });

export const upsertTestimonial = (
  payload: Record<string, unknown>,
): Promise<unknown> =>
  adminFetch("/api/admin/testimonials", { method: "POST", body: payload });

export const deleteTestimonial = (id: string): Promise<unknown> =>
  adminFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });

export const reorderTestimonials = (orderedIds: string[]): Promise<unknown> =>
  adminFetch("/api/admin/testimonials/reorder", {
    method: "POST",
    body: { orderedIds },
  });

const normalizeMediaAsset = (row: Record<string, unknown>): MediaAsset => ({
  id: String(row.id),
  url: String(row.public_url || row.url || ""),
  public_url: row.public_url ? String(row.public_url) : undefined,
  path: row.path ? String(row.path) : undefined,
  alt: row.alt ? String(row.alt) : undefined,
  mime: row.mime ? String(row.mime) : undefined,
  mime_type: row.mime
    ? String(row.mime)
    : row.mime_type
      ? String(row.mime_type)
      : undefined,
  size_bytes:
    typeof row.size_bytes === "number" ? row.size_bytes : undefined,
  created_at: row.created_at ? String(row.created_at) : undefined,
});

export const listMedia = async (): Promise<MediaAsset[]> => {
  const rows = await adminFetch<Array<Record<string, unknown>>>(
    "/api/admin/media",
  );
  return (Array.isArray(rows) ? rows : []).map(normalizeMediaAsset);
};

export const uploadMedia = async (
  file: File,
  alt = "",
): Promise<MediaAsset> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("alt", alt);
  const row = await adminFetch<Record<string, unknown>>(
    "/api/admin/media/upload",
    {
      method: "POST",
      formData,
    },
  );
  return normalizeMediaAsset(row);
};

export const deleteMedia = (id: string): Promise<unknown> =>
  adminFetch(`/api/admin/media/${id}`, { method: "DELETE" });

export const publishSection = (
  section: PublishSection,
): Promise<unknown> =>
  adminFetch("/api/admin/publish", {
    method: "POST",
    body: { section },
  });

export const getPublishLog = (): Promise<unknown[]> =>
  adminFetch("/api/admin/publish-log");
