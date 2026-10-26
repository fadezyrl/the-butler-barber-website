-- Our Team CMS table

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  media_url TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'image' CHECK (kind IN ('image', 'video')),
  name TEXT NOT NULL DEFAULT '',
  role_en TEXT NOT NULL DEFAULT '',
  role_ar TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  bio_ar TEXT NOT NULL DEFAULT '',
  alt_en TEXT NOT NULL DEFAULT '',
  alt_ar TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  draft_media_url TEXT NOT NULL DEFAULT '',
  draft_kind TEXT NOT NULL DEFAULT 'image',
  draft_name TEXT NOT NULL DEFAULT '',
  draft_role_en TEXT NOT NULL DEFAULT '',
  draft_role_ar TEXT NOT NULL DEFAULT '',
  draft_bio_en TEXT NOT NULL DEFAULT '',
  draft_bio_ar TEXT NOT NULL DEFAULT '',
  draft_alt_en TEXT NOT NULL DEFAULT '',
  draft_alt_ar TEXT NOT NULL DEFAULT '',
  draft_sort_order INT NOT NULL DEFAULT 0,
  draft_is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_sort ON team_members(sort_order);
