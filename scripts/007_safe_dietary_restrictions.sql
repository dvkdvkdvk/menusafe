-- Safe migration: Add dietary_restrictions column if it doesn't exist
-- This uses DO block to handle the case where column already exists

DO $$ 
BEGIN
    -- Check if column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'dietary_restrictions'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dietary_restrictions JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Migrate existing data from legacy boolean fields
UPDATE profiles 
SET dietary_restrictions = (
  CASE 
    WHEN gluten_free = true AND lactose_free = true THEN '["gluten", "dairy"]'::jsonb
    WHEN gluten_free = true THEN '["gluten"]'::jsonb
    WHEN lactose_free = true THEN '["dairy"]'::jsonb
    ELSE '[]'::jsonb
  END
)
WHERE (dietary_restrictions IS NULL OR dietary_restrictions = '[]'::jsonb)
  AND (gluten_free = true OR lactose_free = true);
