-- Add new columns to occasions table for "Just Because" functionality
DO $$ BEGIN
  -- Check if is_just_because column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'occasions' AND column_name = 'is_just_because'
  ) THEN
    ALTER TABLE "occasions" ADD COLUMN "is_just_because" boolean DEFAULT false NOT NULL;
    RAISE NOTICE 'Column is_just_because added successfully';
  ELSE
    RAISE NOTICE 'Column is_just_because already exists';
  END IF;

  -- Check if computed_send_date column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'occasions' AND column_name = 'computed_send_date'
  ) THEN
    ALTER TABLE "occasions" ADD COLUMN "computed_send_date" timestamp;
    RAISE NOTICE 'Column computed_send_date added successfully';
  ELSE
    RAISE NOTICE 'Column computed_send_date already exists';
  END IF;

  -- Check if card_variation column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'occasions' AND column_name = 'card_variation'
  ) THEN
    ALTER TABLE "occasions" ADD COLUMN "card_variation" varchar(50);
    RAISE NOTICE 'Column card_variation added successfully';
  ELSE
    RAISE NOTICE 'Column card_variation already exists';
  END IF;

  -- Check if last_sent_year column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'occasions' AND column_name = 'last_sent_year'
  ) THEN
    ALTER TABLE "occasions" ADD COLUMN "last_sent_year" integer;
    RAISE NOTICE 'Column last_sent_year added successfully';
  ELSE
    RAISE NOTICE 'Column last_sent_year already exists';
  END IF;
END $$;

-- Create indexes for efficient cron queries
CREATE INDEX IF NOT EXISTS "occasions_computed_send_date_idx" ON "occasions" ("computed_send_date");
CREATE INDEX IF NOT EXISTS "occasions_is_just_because_idx" ON "occasions" ("is_just_because");

