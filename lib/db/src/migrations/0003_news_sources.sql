-- News Engine source metadata.
-- Safe for existing installations: columns/index are added only when missing.
ALTER TABLE news ADD COLUMN IF NOT EXISTS source_name text;
ALTER TABLE news ADD COLUMN IF NOT EXISTS source_url text;
CREATE UNIQUE INDEX IF NOT EXISTS news_source_url_unique_idx ON news (source_url) WHERE source_url IS NOT NULL;
