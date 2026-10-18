import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { env, hasSupabaseStorage } from "../config/env.js";
import { loadStore, saveStore, newId } from "../db/file-store.js";
import { AppError } from "../middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadDir = path.resolve(__dirname, "../../uploads");

const getSupabase = () => {
  if (!hasSupabaseStorage()) return null;
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
};

const ensureLocalDir = () => {
  if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
  }
};

export const uploadMedia = async ({ file, alt = "", adminId = null }) => {
  if (!file) {
    throw new AppError("No file provided", 400);
  }

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  if (!allowed.includes(file.mimetype)) {
    throw new AppError("Unsupported file type", 400);
  }

  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new AppError("File too large (max 25MB)", 400);
  }

  const ext = path.extname(file.originalname) || "";
  const objectPath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext}`;

  let publicUrl;
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.storage
      .from(env.STORAGE_BUCKET)
      .upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new AppError(`Upload failed: ${error.message}`, 500);
    }

    const { data } = supabase.storage
      .from(env.STORAGE_BUCKET)
      .getPublicUrl(objectPath);
    publicUrl = data.publicUrl;
  } else {
    ensureLocalDir();
    const filename = objectPath.replace(/\//g, "_");
    const fullPath = path.join(localUploadDir, filename);
    fs.writeFileSync(fullPath, file.buffer);
    publicUrl = `http://localhost:${env.PORT}/uploads/${filename}`;
  }

  const store = loadStore();
  const asset = {
    id: newId(),
    path: objectPath,
    public_url: publicUrl,
    mime: file.mimetype,
    size_bytes: file.size,
    alt,
    created_by: adminId,
    created_at: new Date().toISOString(),
  };
  store.media_assets.unshift(asset);
  saveStore(store);
  return asset;
};

export const deleteMedia = async (id) => {
  const store = loadStore();
  const asset = store.media_assets.find((m) => m.id === id);
  if (!asset) {
    throw new AppError("Media not found", 404);
  }

  const supabase = getSupabase();
  if (supabase) {
    await supabase.storage.from(env.STORAGE_BUCKET).remove([asset.path]);
  } else {
    const filename = asset.path.replace(/\//g, "_");
    const fullPath = path.join(localUploadDir, filename);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }

  store.media_assets = store.media_assets.filter((m) => m.id !== id);
  saveStore(store);
  return { deleted: true };
};

export const listMedia = async () => {
  const store = loadStore();
  return store.media_assets;
};
