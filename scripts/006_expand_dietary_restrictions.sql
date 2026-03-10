-- Add comprehensive dietary restrictions as JSONB array
-- This replaces the individual boolean columns (gluten_free, lactose_free)

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB DEFAULT '[]'::jsonb;

-- Migrate existing data (using 'dairy' to match the restriction ID in code)
UPDATE profiles 
SET dietary_restrictions = (
  CASE 
    WHEN gluten_free AND lactose_free THEN '["gluten", "dairy"]'::jsonb
    WHEN gluten_free THEN '["gluten"]'::jsonb
    WHEN lactose_free THEN '["dairy"]'::jsonb
    ELSE '[]'::jsonb
  END
)
WHERE dietary_restrictions = '[]'::jsonb OR dietary_restrictions IS NULL;

-- Add image_url to scans for reanalysis
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS image_data TEXT;
