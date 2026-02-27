CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS "user";

DO $$ BEGIN
  CREATE TYPE "account_type" AS ENUM ('crypto', 'forex', 'stocks');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "trade_type" AS ENUM ('executed', 'missed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "direction" AS ENUM ('long', 'short');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "position_type" AS ENUM ('spot', 'futures');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "margin_mode" AS ENUM ('cross', 'isolated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "win_loss_flag" AS ENUM ('win', 'loss', 'breakeven');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "holding_bucket" AS ENUM ('scalp', 'intraday', 'swing', 'position');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "position_size_unit" AS ENUM ('lot', 'usd', 'contract');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "failed_login_attempts" integer NOT NULL DEFAULT 0,
  "locked_until" timestamptz,
  "refresh_token_hash" varchar(255),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");

