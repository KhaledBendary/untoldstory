-- Global Untold Story — content database
--
-- Replaces the Laravel CMS. One Postgres database holds every piece of content
-- the site renders, and the /admin dashboard is the only thing that writes to
-- it. The public site reads from it at build time and through ISR.
--
-- Translation model: the editor writes English and Arabic by hand. The other
-- seven indexed languages (fr, de, es, it, pt, ru, tr) are machine-translated
-- from English and cached in the same JSONB, so a translatable field looks like
--   { "en": "...", "ar": "...", "fr": "...", ... }
-- with en/ar authored and the rest generated. A field with only en/ar is valid;
-- the generated languages are filled on publish.
--
-- Non-translatable values (a slug, an image URL, a sort order, a flag) are real
-- columns so they can be indexed and ordered. Everything else lives in `data`.

-- ---------------------------------------------------------------------------
-- Services, projects, posts — the repeating collections.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS services (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  image_url   TEXT,
  price       TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  -- title, shortDesc, fullDesc, features, seo — each { en, ar, fr, ... }
  data        JSONB   NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  image         TEXT,
  video         TEXT,
  video_embed   TEXT,
  video_type    TEXT,
  category_slug TEXT,
  grid_size     TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  -- title, client, category, description, results, metric — each { en, ar, ... }
  data          JSONB   NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  featured_image TEXT,
  author_name    TEXT,
  author_image   TEXT,
  category_slug  TEXT,
  read_minutes   INTEGER,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  published_at   TIMESTAMPTZ,
  -- title, excerpt, body, category, seo — each { en, ar, ... }
  data           JSONB   NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Singletons — the one-of-a-kind pages whose shape is deeply nested:
-- the homepage, the shared layout (nav/footer/labels), and the about page.
-- Each is one row holding the whole document; the dashboard edits the fields
-- inside it. Translatable strings inside are still { en, ar, ... }.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS singletons (
  key        TEXT PRIMARY KEY,            -- 'home' | 'layout' | 'about'
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Media — every image uploaded through the dashboard, stored in Vercel Blob.
-- The row is the record; `url` points at the blob.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS media (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url         TEXT NOT NULL,
  pathname    TEXT NOT NULL,
  filename    TEXT NOT NULL,
  content_type TEXT,
  size_bytes  BIGINT,
  width       INTEGER,
  height      INTEGER,
  alt         JSONB NOT NULL DEFAULT '{}'::jsonb,   -- { en, ar } alt text
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Dashboard accounts. One or a few people, so no roles — an account can do
-- everything. The password is stored only as a scrypt hash; the plaintext
-- never touches the database or the code.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS admin_users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- Indexes for the reads the site and dashboard actually make.
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS services_order  ON services  (sort_order, id);
CREATE INDEX IF NOT EXISTS projects_order  ON projects  (sort_order, id);
CREATE INDEX IF NOT EXISTS posts_published ON posts     (published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS media_uploaded  ON media     (uploaded_at DESC);
