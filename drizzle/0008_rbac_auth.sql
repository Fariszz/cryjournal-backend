ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "google_id" varchar(255);

ALTER TABLE "users"
  ALTER COLUMN "password_hash" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_unique" ON "users" ("google_id");

CREATE TABLE IF NOT EXISTS "roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(64) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_unique" ON "roles" ("name");

CREATE TABLE IF NOT EXISTS "user_roles" (
  "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "role_id" uuid NOT NULL REFERENCES "roles" ("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "role_id")
);

INSERT INTO "roles" ("name")
VALUES ('ADMIN'), ('USER')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "user_roles" ("user_id", "role_id")
SELECT u."id", r."id"
FROM "users" u
CROSS JOIN "roles" r
WHERE r."name" = 'USER'
ON CONFLICT ("user_id", "role_id") DO NOTHING;
