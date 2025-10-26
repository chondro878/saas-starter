-- Create recipients table
CREATE TABLE IF NOT EXISTS "recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"relationship" varchar(50) NOT NULL,
	"street" varchar(255) NOT NULL,
	"apartment" varchar(100),
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip" varchar(20) NOT NULL,
	"country" varchar(100) DEFAULT 'United States' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

-- Create occasions table
CREATE TABLE IF NOT EXISTS "occasions" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient_id" integer NOT NULL,
	"occasion_type" varchar(50) NOT NULL,
	"occasion_date" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "occasions_recipient_id_recipients_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "recipients"("id") ON DELETE no action ON UPDATE no action
);

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS "user_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"is_default" integer DEFAULT 0 NOT NULL,
	"street" varchar(255) NOT NULL,
	"apartment" varchar(100),
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip" varchar(20) NOT NULL,
	"country" varchar(100) DEFAULT 'United States' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

