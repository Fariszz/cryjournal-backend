CREATE TYPE "public"."account_type" AS ENUM('crypto', 'forex', 'stocks');--> statement-breakpoint
CREATE TYPE "public"."direction" AS ENUM('long', 'short');--> statement-breakpoint
CREATE TYPE "public"."holding_bucket" AS ENUM('scalp', 'intraday', 'swing', 'position');--> statement-breakpoint
CREATE TYPE "public"."margin_mode" AS ENUM('cross', 'isolated');--> statement-breakpoint
CREATE TYPE "public"."position_size_unit" AS ENUM('lot', 'usd', 'contract');--> statement-breakpoint
CREATE TYPE "public"."position_type" AS ENUM('spot', 'futures');--> statement-breakpoint
CREATE TYPE "public"."trade_type" AS ENUM('executed', 'missed');--> statement-breakpoint
CREATE TYPE "public"."win_loss_flag" AS ENUM('win', 'loss', 'breakeven');--> statement-breakpoint
CREATE TABLE "account_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid,
	"name" varchar(150) NOT NULL,
	"broker" varchar(150) NOT NULL,
	"account_type" "account_type" NOT NULL,
	"base_currency" varchar(12) NOT NULL,
	"timezone" varchar(64) NOT NULL,
	"starting_balance" numeric(20, 8),
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demon_evidence_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demon_id" uuid NOT NULL,
	"trade_id" uuid,
	"daily_journal_id" uuid,
	"note" text,
	"screenshot_path" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demon_performance_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demon_id" uuid NOT NULL,
	"date" date NOT NULL,
	"density_score" numeric(12, 6),
	"pnl_when_present" numeric(20, 8),
	"pnl_when_absent" numeric(20, 8),
	"winrate_present" numeric(12, 6),
	"winrate_absent" numeric(12, 6),
	"snapshot_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"behavioral_density_score" numeric(12, 6),
	"trigger" text,
	"pattern" text,
	"consequence" text,
	"counter_plan" text,
	"prevention_checklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" varchar(64) NOT NULL,
	"category" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_journal_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_journal_id" uuid NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"caption" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_journal_demons" (
	"daily_journal_id" uuid NOT NULL,
	"demon_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_journal_trades" (
	"daily_journal_id" uuid NOT NULL,
	"trade_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_journals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"account_id" uuid,
	"mood" integer,
	"energy" integer,
	"focus" integer,
	"confidence" integer,
	"plan" text,
	"execution_notes" text,
	"lessons" text,
	"next_actions" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"default_timezone" varchar(64) NOT NULL,
	"default_currency" varchar(12) NOT NULL,
	"default_date_range_preset" varchar(32) NOT NULL,
	"session_definitions" jsonb,
	"risk_parameters" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"playbook_score_schema" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_confluences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"impact_weight" numeric(12, 6) NOT NULL,
	"rule_type" varchar(64) NOT NULL,
	"rule_config" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" uuid NOT NULL,
	"step_index" integer NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_condition_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"label" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"label" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" uuid NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"caption" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_confluence_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" uuid NOT NULL,
	"confluence_id" uuid NOT NULL,
	"checked" integer DEFAULT 0 NOT NULL,
	"weight_snapshot" numeric(12, 6) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_context_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" uuid NOT NULL,
	"provider_event_id" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"impact" varchar(32),
	"currency" varchar(12),
	"event_time" timestamp with time zone NOT NULL,
	"raw" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_demon_pivot" (
	"trade_id" uuid NOT NULL,
	"demon_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_market_condition_pivot" (
	"trade_id" uuid NOT NULL,
	"market_condition_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_market_condition_tag_pivot" (
	"trade_id" uuid NOT NULL,
	"market_condition_tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_tag_pivot" (
	"trade_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "trade_type" NOT NULL,
	"instrument_id" uuid NOT NULL,
	"direction" "direction" NOT NULL,
	"timezone" varchar(64) NOT NULL,
	"entry_datetime" timestamp with time zone NOT NULL,
	"exit_datetime" timestamp with time zone,
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
	"strategy_id" uuid,
	"thesis" text,
	"post_analysis" text,
	"notes" text,
	"pnl" numeric(20, 8),
	"r_multiple" numeric(12, 6),
	"win_loss_flag" "win_loss_flag",
	"holding_time_seconds" integer,
	"holding_bucket" "holding_bucket",
	"decision_quality_score" numeric(12, 6),
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"refresh_token_hash" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_group_id_account_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."account_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demon_evidence_logs" ADD CONSTRAINT "demon_evidence_logs_demon_id_demons_id_fk" FOREIGN KEY ("demon_id") REFERENCES "public"."demons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demon_evidence_logs" ADD CONSTRAINT "demon_evidence_logs_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demon_evidence_logs" ADD CONSTRAINT "demon_evidence_logs_daily_journal_id_daily_journals_id_fk" FOREIGN KEY ("daily_journal_id") REFERENCES "public"."daily_journals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demon_performance_logs" ADD CONSTRAINT "demon_performance_logs_demon_id_demons_id_fk" FOREIGN KEY ("demon_id") REFERENCES "public"."demons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_journal_attachments" ADD CONSTRAINT "daily_journal_attachments_daily_journal_id_daily_journals_id_fk" FOREIGN KEY ("daily_journal_id") REFERENCES "public"."daily_journals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_journal_demons" ADD CONSTRAINT "daily_journal_demons_daily_journal_id_daily_journals_id_fk" FOREIGN KEY ("daily_journal_id") REFERENCES "public"."daily_journals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_journal_demons" ADD CONSTRAINT "daily_journal_demons_demon_id_demons_id_fk" FOREIGN KEY ("demon_id") REFERENCES "public"."demons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_journal_trades" ADD CONSTRAINT "daily_journal_trades_daily_journal_id_daily_journals_id_fk" FOREIGN KEY ("daily_journal_id") REFERENCES "public"."daily_journals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_journal_trades" ADD CONSTRAINT "daily_journal_trades_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_journals" ADD CONSTRAINT "daily_journals_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_confluences" ADD CONSTRAINT "strategy_confluences_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_steps" ADD CONSTRAINT "strategy_steps_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_attachments" ADD CONSTRAINT "trade_attachments_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_confluence_checks" ADD CONSTRAINT "trade_confluence_checks_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_confluence_checks" ADD CONSTRAINT "trade_confluence_checks_confluence_id_strategy_confluences_id_fk" FOREIGN KEY ("confluence_id") REFERENCES "public"."strategy_confluences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_context_events" ADD CONSTRAINT "trade_context_events_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_demon_pivot" ADD CONSTRAINT "trade_demon_pivot_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_demon_pivot" ADD CONSTRAINT "trade_demon_pivot_demon_id_demons_id_fk" FOREIGN KEY ("demon_id") REFERENCES "public"."demons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_market_condition_pivot" ADD CONSTRAINT "trade_market_condition_pivot_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_market_condition_pivot" ADD CONSTRAINT "trade_market_condition_pivot_market_condition_id_market_conditions_id_fk" FOREIGN KEY ("market_condition_id") REFERENCES "public"."market_conditions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_market_condition_tag_pivot" ADD CONSTRAINT "trade_market_condition_tag_pivot_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_market_condition_tag_pivot" ADD CONSTRAINT "trade_market_condition_tag_pivot_market_condition_tag_id_market_condition_tags_id_fk" FOREIGN KEY ("market_condition_tag_id") REFERENCES "public"."market_condition_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_tag_pivot" ADD CONSTRAINT "trade_tag_pivot_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_tag_pivot" ADD CONSTRAINT "trade_tag_pivot_tag_id_trade_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."trade_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_group_id_idx" ON "accounts" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "accounts_deleted_at_idx" ON "accounts" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "demon_performance_logs_demon_date_unique" ON "demon_performance_logs" USING btree ("demon_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "instruments_symbol_unique" ON "instruments" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "instruments_symbol_idx" ON "instruments" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "instruments_category_idx" ON "instruments" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_journal_demons_unique" ON "daily_journal_demons" USING btree ("daily_journal_id","demon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_journal_trades_unique" ON "daily_journal_trades" USING btree ("daily_journal_id","trade_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_journals_date_account_unique" ON "daily_journals" USING btree ("date","account_id");--> statement-breakpoint
CREATE INDEX "strategy_confluences_strategy_id_idx" ON "strategy_confluences" USING btree ("strategy_id");--> statement-breakpoint
CREATE INDEX "strategy_confluences_sort_order_idx" ON "strategy_confluences" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "strategy_steps_strategy_id_idx" ON "strategy_steps" USING btree ("strategy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trade_confluence_checks_unique" ON "trade_confluence_checks" USING btree ("trade_id","confluence_id");--> statement-breakpoint
CREATE INDEX "trade_confluence_checks_trade_idx" ON "trade_confluence_checks" USING btree ("trade_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trade_demon_pivot_unique" ON "trade_demon_pivot" USING btree ("trade_id","demon_id");--> statement-breakpoint
CREATE INDEX "trade_demon_pivot_trade_idx" ON "trade_demon_pivot" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "trade_demon_pivot_demon_idx" ON "trade_demon_pivot" USING btree ("demon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trade_market_condition_pivot_unique" ON "trade_market_condition_pivot" USING btree ("trade_id","market_condition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trade_market_condition_tag_pivot_unique" ON "trade_market_condition_tag_pivot" USING btree ("trade_id","market_condition_tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trade_tag_pivot_unique" ON "trade_tag_pivot" USING btree ("trade_id","tag_id");--> statement-breakpoint
CREATE INDEX "trade_tag_pivot_trade_idx" ON "trade_tag_pivot" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "trade_tag_pivot_tag_idx" ON "trade_tag_pivot" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "trades_account_entry_datetime_idx" ON "trades" USING btree ("account_id","entry_datetime");--> statement-breakpoint
CREATE INDEX "trades_instrument_id_idx" ON "trades" USING btree ("instrument_id");--> statement-breakpoint
CREATE INDEX "trades_strategy_id_idx" ON "trades" USING btree ("strategy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");