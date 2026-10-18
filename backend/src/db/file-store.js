import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";
import {
  clearPgCache,
  loadStoreFromPg,
  saveStoreToPg,
} from "./pg-store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, "../../data/cms-store.json");

const emptyStore = () => ({
  admins: [],
  site_settings: null,
  locale_copy: {},
  service_categories: [],
  service_items: [],
  gallery_items: [],
  testimonials: [],
  opening_hours: [],
  media_assets: [],
  publish_log: [],
});

let cache = null;
let mode = env.DB_MODE || "file";

const ensureDir = () => {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

export const initStore = async () => {
  mode = env.DB_MODE || "file";
  if (mode === "postgres") {
    try {
      cache = await loadStoreFromPg();
      console.log("CMS store: Postgres");
      return;
    } catch (err) {
      console.error(
        "Postgres unavailable, falling back to file store:",
        err.message,
      );
      mode = "file";
      clearPgCache();
    }
  }

  ensureDir();
  if (!fs.existsSync(DATA_PATH)) {
    cache = emptyStore();
    fs.writeFileSync(DATA_PATH, JSON.stringify(cache, null, 2));
  } else {
    cache = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  }
  console.log("CMS store: file", DATA_PATH);
};

export const loadStore = () => {
  if (!cache) {
    ensureDir();
    if (fs.existsSync(DATA_PATH)) {
      cache = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    } else {
      cache = emptyStore();
    }
  }
  return cache;
};

export const saveStore = (store = cache) => {
  cache = store;
  if (mode === "postgres") {
    // Fire-and-forget async persist; callers are sync today
    saveStoreToPg(store).catch((err) => {
      console.error("Postgres save failed:", err.message);
      ensureDir();
      fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
    });
    return;
  }
  ensureDir();
  fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
};

export const saveStoreAsync = async (store = cache) => {
  cache = store;
  if (mode === "postgres") {
    await saveStoreToPg(store);
    return;
  }
  ensureDir();
  fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
};

export const resetStore = (data) => {
  cache = { ...emptyStore(), ...data };
  ensureDir();
  fs.writeFileSync(DATA_PATH, JSON.stringify(cache, null, 2));
  if (mode === "postgres") {
    saveStoreToPg(cache).catch((err) =>
      console.error("Postgres reset failed:", err.message),
    );
  }
  return cache;
};

export const newId = () => randomUUID();

export const getDataPath = () => DATA_PATH;

export const getStoreMode = () => mode;
