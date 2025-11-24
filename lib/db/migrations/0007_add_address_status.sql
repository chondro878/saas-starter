-- Add address status tracking to recipients table
-- This allows tracking of address verification state and issues

-- Add address_status column
ALTER TABLE "recipients" ADD COLUMN IF NOT EXISTS "address_status" varchar(20) DEFAULT 'pending' NOT NULL;

-- Add address_notes column for storing verification details
ALTER TABLE "recipients" ADD COLUMN IF NOT EXISTS "address_notes" text;

-- Add address_verified_at column to track when address was last verified
ALTER TABLE "recipients" ADD COLUMN IF NOT EXISTS "address_verified_at" timestamp;

-- Create index for querying recipients with address issues
CREATE INDEX IF NOT EXISTS "recipients_address_status_idx" ON "recipients" ("address_status");

-- Add comment explaining status values
COMMENT ON COLUMN "recipients"."address_status" IS 'Address verification status: pending (not yet verified), verified (confirmed by USPS), corrected (USPS standardized), invalid (undeliverable), error (verification failed)';

