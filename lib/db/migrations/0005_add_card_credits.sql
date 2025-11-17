-- Add card_credits column to teams table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'card_credits'
    ) THEN
        ALTER TABLE "teams" ADD COLUMN "card_credits" integer DEFAULT 0 NOT NULL;
    END IF;
END $$;

