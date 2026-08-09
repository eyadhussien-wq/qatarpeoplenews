ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "source_name" text;
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "source_url" text;

CREATE INDEX IF NOT EXISTS "news_source_idx" ON "news" ("source_name");
CREATE UNIQUE INDEX IF NOT EXISTS "news_source_url_unique_idx" ON "news" ("source_url") WHERE "source_url" IS NOT NULL;
