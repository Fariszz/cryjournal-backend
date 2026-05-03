DROP INDEX "instruments_symbol_unique";--> statement-breakpoint
DROP INDEX "daily_journals_date_account_unique";--> statement-breakpoint
ALTER TABLE "demons" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "instruments" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_journals" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "strategies" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "demons" ADD CONSTRAINT "demons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instruments" ADD CONSTRAINT "instruments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_journals" ADD CONSTRAINT "daily_journals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "demons_user_id_idx" ON "demons" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "instruments_user_symbol_unique" ON "instruments" USING btree ("user_id","symbol");--> statement-breakpoint
CREATE INDEX "instruments_user_id_idx" ON "instruments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_journals_user_id_idx" ON "daily_journals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "strategies_user_id_idx" ON "strategies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trades_user_entry_datetime_idx" ON "trades" USING btree ("user_id","entry_datetime");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_journals_date_account_unique" ON "daily_journals" USING btree ("user_id","date","account_id");