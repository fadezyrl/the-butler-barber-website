-- The Butler Barber CMS schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  draft_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locale_copy (
  locale TEXT PRIMARY KEY CHECK (locale IN ('en', 'ar')),
  draft_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  draft_is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  name_en TEXT NOT NULL DEFAULT '',
  name_ar TEXT NOT NULL DEFAULT '',
  draft_name_en TEXT NOT NULL DEFAULT '',
  draft_name_ar TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  price TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'BD',
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  draft_price TEXT NOT NULL DEFAULT '',
  draft_currency TEXT NOT NULL DEFAULT 'BD',
  draft_sort_order INT NOT NULL DEFAULT 0,
  draft_is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  name_en TEXT NOT NULL DEFAULT '',
  name_ar TEXT NOT NULL DEFAULT '',
  draft_name_en TEXT NOT NULL DEFAULT '',
  draft_name_ar TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'image' CHECK (kind IN ('image', 'video')),
  alt_en TEXT NOT NULL DEFAULT '',
  alt_ar TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  draft_media_url TEXT NOT NULL DEFAULT '',
  draft_kind TEXT NOT NULL DEFAULT 'image',
  draft_alt_en TEXT NOT NULL DEFAULT '',
  draft_alt_ar TEXT NOT NULL DEFAULT '',
  draft_sort_order INT NOT NULL DEFAULT 0,
  draft_is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  quote_en TEXT NOT NULL DEFAULT '',
  quote_ar TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  draft_name TEXT NOT NULL DEFAULT '',
  draft_quote_en TEXT NOT NULL DEFAULT '',
  draft_quote_ar TEXT NOT NULL DEFAULT '',
  draft_source TEXT NOT NULL DEFAULT '',
  draft_sort_order INT NOT NULL DEFAULT 0,
  draft_is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opening_hours (
  day TEXT PRIMARY KEY CHECK (day IN ('sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri')),
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  opens TEXT NOT NULL DEFAULT '09:00',
  closes TEXT NOT NULL DEFAULT '23:30',
  display_override TEXT,
  draft_is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  draft_opens TEXT NOT NULL DEFAULT '09:00',
  draft_closes TEXT NOT NULL DEFAULT '23:30',
  draft_display_override TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime TEXT NOT NULL DEFAULT '',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  alt TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publish_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_items_category ON service_items(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON testimonials(sort_order);
