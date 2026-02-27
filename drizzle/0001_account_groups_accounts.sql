CREATE TABLE IF NOT EXISTS "account_groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(150) NOT NULL,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "group_id" uuid REFERENCES "account_groups"("id") ON DELETE SET NULL,
  "name" varchar(150) NOT NULL,
  "broker" varchar(150) NOT NULL,
  "account_type" "account_type" NOT NULL,
  "base_currency" varchar(12) NOT NULL,
  "timezone" varchar(64) NOT NULL,
  "starting_balance" numeric(20, 8),
  "deleted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "accounts_group_id_idx" ON "accounts" ("group_id");
CREATE INDEX IF NOT EXISTS "accounts_deleted_at_idx" ON "accounts" ("deleted_at");

