CREATE TABLE IF NOT EXISTS "market_condition_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(64) NOT NULL,
  "label" varchar(128) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "market_condition_tags_key_unique" ON "market_condition_tags" ("key");

CREATE TABLE IF NOT EXISTS "market_conditions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar(64) NOT NULL,
  "label" varchar(128) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "market_conditions_key_unique" ON "market_conditions" ("key");

CREATE TABLE IF NOT EXISTS "trade_market_condition_tag_pivot" (
  "trade_id" uuid NOT NULL REFERENCES "trades"("id") ON DELETE CASCADE,
  "market_condition_tag_id" uuid NOT NULL REFERENCES "market_condition_tags"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "trade_market_condition_tag_pivot_unique"
  ON "trade_market_condition_tag_pivot" ("trade_id", "market_condition_tag_id");

CREATE TABLE IF NOT EXISTS "trade_market_condition_pivot" (
  "trade_id" uuid NOT NULL REFERENCES "trades"("id") ON DELETE CASCADE,
  "market_condition_id" uuid NOT NULL REFERENCES "market_conditions"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "trade_market_condition_pivot_unique"
  ON "trade_market_condition_pivot" ("trade_id", "market_condition_id");

