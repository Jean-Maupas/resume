-- migrations/001_init.sql
-- Run once against your Neon database:
--   psql $DATABASE_URL < migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── CV versions ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cv_versions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  yaml_content TEXT        NOT NULL,
  parsed_json  JSONB       NOT NULL,
  label        VARCHAR(200),
  is_current   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforces single current version at the DB level
CREATE UNIQUE INDEX IF NOT EXISTS cv_versions_current_unique
  ON cv_versions (is_current)
  WHERE is_current = TRUE;

-- ── Submissions ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS submissions (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_version_id  UUID        REFERENCES cv_versions(id) ON DELETE SET NULL,
  company        VARCHAR(200) NOT NULL,
  position       VARCHAR(200) NOT NULL,
  job_url        TEXT,
  profile_used   VARCHAR(50)  NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'applied'
                   CONSTRAINT submissions_status_check
                   CHECK (status IN ('applied','screening','interview','offer','rejected','withdrawn')),
  date_applied   DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS submissions_status_idx        ON submissions (status);
CREATE INDEX IF NOT EXISTS submissions_profile_idx       ON submissions (profile_used);
CREATE INDEX IF NOT EXISTS submissions_cv_version_idx    ON submissions (cv_version_id);

-- ── Auth sessions ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS auth_sessions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_hash  TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_sessions_token_idx   ON auth_sessions (token_hash);
CREATE INDEX IF NOT EXISTS auth_sessions_expires_idx ON auth_sessions (expires_at);

-- ── Page views / analytics ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_views (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile       VARCHAR(50),
  path          VARCHAR(200),
  download_type VARCHAR(20),  -- 'pdf' | 'docx' | NULL
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_views_created_idx ON page_views (created_at);

-- ── PL/pgSQL helpers (atomic, avoids multi-round-trips) ────────────────────

-- Save a new CV version and atomically mark it as current.
CREATE OR REPLACE FUNCTION set_current_cv_version(
  p_yaml_content TEXT,
  p_parsed_json  JSONB,
  p_label        VARCHAR
) RETURNS cv_versions AS $$
DECLARE
  v cv_versions;
BEGIN
  UPDATE cv_versions SET is_current = FALSE WHERE is_current = TRUE;
  INSERT INTO cv_versions (yaml_content, parsed_json, label, is_current)
    VALUES (p_yaml_content, p_parsed_json, p_label, TRUE)
    RETURNING * INTO v;
  RETURN v;
END;
$$ LANGUAGE plpgsql;

-- Restore an older version as current.
CREATE OR REPLACE FUNCTION restore_cv_version(p_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE cv_versions SET is_current = FALSE WHERE is_current = TRUE;
  UPDATE cv_versions SET is_current = TRUE  WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'cv_version % not found', p_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at on submissions
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS submissions_updated_at ON submissions;
CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
