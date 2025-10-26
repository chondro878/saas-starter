-- Add first_name, last_name, and phone fields to users table
ALTER TABLE "users" ADD COLUMN "first_name" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN "last_name" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN "phone" VARCHAR(20);

