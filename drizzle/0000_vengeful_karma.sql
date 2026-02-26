CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"email" varchar,
	"emailVerified" boolean DEFAULT false
);
