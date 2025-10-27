-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient_id" integer,
	"occasion_id" integer,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"card_type" varchar(20) DEFAULT 'subscription' NOT NULL,
	"occasion_date" timestamp NOT NULL,
	"print_date" timestamp,
	"mail_date" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"recipient_first_name" varchar(100) NOT NULL,
	"recipient_last_name" varchar(100) NOT NULL,
	"recipient_street" varchar(255) NOT NULL,
	"recipient_apartment" varchar(100),
	"recipient_city" varchar(100) NOT NULL,
	"recipient_state" varchar(50) NOT NULL,
	"recipient_zip" varchar(20) NOT NULL,
	"return_name" varchar(200) NOT NULL,
	"return_street" varchar(255) NOT NULL,
	"return_apartment" varchar(100),
	"return_city" varchar(100) NOT NULL,
	"return_state" varchar(50) NOT NULL,
	"return_zip" varchar(20) NOT NULL,
	"occasion_type" varchar(50) NOT NULL,
	"occasion_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_recipient_id_recipients_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "recipients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "occasions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders" ("user_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "orders_occasion_date_idx" ON "orders" ("occasion_date");
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" ("created_at");

