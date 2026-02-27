CREATE TABLE IF NOT EXISTS "instruments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "symbol" varchar(64) NOT NULL,
  "category" varchar(64) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "instruments_symbol_unique" ON "instruments" ("symbol");
CREATE INDEX IF NOT EXISTS "instruments_symbol_idx" ON "instruments" ("symbol");
CREATE INDEX IF NOT EXISTS "instruments_category_idx" ON "instruments" ("category");

