-- Add new columns to recipients table for couple functionality
DO $$ BEGIN
  -- Check if second_first_name column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipients' AND column_name = 'second_first_name'
  ) THEN
    ALTER TABLE "recipients" ADD COLUMN "second_first_name" varchar(100);
    RAISE NOTICE 'Column second_first_name added successfully';
  ELSE
    RAISE NOTICE 'Column second_first_name already exists';
  END IF;

  -- Check if second_last_name column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipients' AND column_name = 'second_last_name'
  ) THEN
    ALTER TABLE "recipients" ADD COLUMN "second_last_name" varchar(100);
    RAISE NOTICE 'Column second_last_name added successfully';
  ELSE
    RAISE NOTICE 'Column second_last_name already exists';
  END IF;

  -- Check if is_couple column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recipients' AND column_name = 'is_couple'
  ) THEN
    ALTER TABLE "recipients" ADD COLUMN "is_couple" boolean DEFAULT false NOT NULL;
    RAISE NOTICE 'Column is_couple added successfully';
  ELSE
    RAISE NOTICE 'Column is_couple already exists';
  END IF;
END $$;

