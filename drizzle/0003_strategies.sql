CREATE TABLE IF NOT EXISTS "strategies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(150) NOT NULL,
  "description" text,
  "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "playbook_score_schema" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "strategy_steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "strategy_id" uuid NOT NULL REFERENCES "strategies"("id") ON DELETE CASCADE,
  "step_index" integer NOT NULL,
  "title" varchar(150) NOT NULL,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "strategy_confluences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "strategy_id" uuid NOT NULL REFERENCES "strategies"("id") ON DELETE CASCADE,
  "name" varchar(150) NOT NULL,
  "impact_weight" numeric(12, 6) NOT NULL,
  "rule_type" varchar(64) NOT NULL,
  "rule_config" jsonb,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "strategy_steps_strategy_id_idx" ON "strategy_steps" ("strategy_id");
CREATE INDEX IF NOT EXISTS "strategy_confluences_strategy_id_idx" ON "strategy_confluences" ("strategy_id");
CREATE INDEX IF NOT EXISTS "strategy_confluences_sort_order_idx" ON "strategy_confluences" ("sort_order");

