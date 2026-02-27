CREATE TABLE IF NOT EXISTS "trade_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(120) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "trade_tags_name_unique" ON "trade_tags" ("name");

CREATE TABLE IF NOT EXISTS "trade_tag_pivot" (
  "trade_id" uuid NOT NULL REFERENCES "trades"("id") ON DELETE CASCADE,
  "tag_id" uuid NOT NULL REFERENCES "trade_tags"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "trade_tag_pivot_unique" ON "trade_tag_pivot" ("trade_id", "tag_id");
CREATE INDEX IF NOT EXISTS "trade_tag_pivot_trade_idx" ON "trade_tag_pivot" ("trade_id");
CREATE INDEX IF NOT EXISTS "trade_tag_pivot_tag_idx" ON "trade_tag_pivot" ("tag_id");

CREATE TABLE IF NOT EXISTS "trade_demon_pivot" (
  "trade_id" uuid NOT NULL REFERENCES "trades"("id") ON DELETE CASCADE,
  "demon_id" uuid NOT NULL REFERENCES "demons"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "trade_demon_pivot_unique" ON "trade_demon_pivot" ("trade_id", "demon_id");
CREATE INDEX IF NOT EXISTS "trade_demon_pivot_trade_idx" ON "trade_demon_pivot" ("trade_id");
CREATE INDEX IF NOT EXISTS "trade_demon_pivot_demon_idx" ON "trade_demon_pivot" ("demon_id");

