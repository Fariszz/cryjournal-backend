CREATE TABLE IF NOT EXISTS "trades" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "account_id" uuid NOT NULL REFERENCES "accounts"("id"),
  "type" "trade_type" NOT NULL,
  "instrument_id" uuid NOT NULL REFERENCES "instruments"("id"),
  "direction" "direction" NOT NULL,
  "timezone" varchar(64) NOT NULL,
  "entry_datetime" timestamptz NOT NULL,
  "exit_datetime" timestamptz,
  "entry_timeframe" varchar(32),
  "trading_session" varchar(32),
  "entry_price" numeric(20, 8),
  "exit_price" numeric(20, 8),
  "stop_loss" numeric(20, 8),
  "take_profit" numeric(20, 8),
  "dollar_risk" numeric(20, 8),
  "position_size" numeric(20, 8),
  "position_size_unit" "position_size_unit",
  "broker_commission" numeric(20, 8),
  "swap" numeric(20, 8),
  "funding_fee" numeric(20, 8),
  "position_type" "position_type",
  "leverage" numeric(12, 6),
  "margin_mode" "margin_mode",
  "strategy_id" uuid REFERENCES "strategies"("id") ON DELETE SET NULL,
  "thesis" text,
  "post_analysis" text,
  "notes" text,
  "pnl" numeric(20, 8),
  "r_multiple" numeric(12, 6),
  "win_loss_flag" "win_loss_flag",
  "holding_time_seconds" integer,
  "holding_bucket" "holding_bucket",
  "decision_quality_score" numeric(12, 6),
  "deleted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "trades_account_entry_datetime_idx" ON "trades" ("account_id", "entry_datetime");
CREATE INDEX IF NOT EXISTS "trades_instrument_id_idx" ON "trades" ("instrument_id");
CREATE INDEX IF NOT EXISTS "trades_strategy_id_idx" ON "trades" ("strategy_id");

