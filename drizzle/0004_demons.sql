CREATE TABLE IF NOT EXISTS "demons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(150) NOT NULL,
  "behavioral_density_score" numeric(12, 6),
  "trigger" text,
  "pattern" text,
  "consequence" text,
  "counter_plan" text,
  "prevention_checklist" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

