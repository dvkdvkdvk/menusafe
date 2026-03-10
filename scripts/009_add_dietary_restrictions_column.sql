-- Add dietary_restrictions column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'dietary_restrictions'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN dietary_restrictions JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Migrate existing data from boolean fields to the new JSONB array
UPDATE public.profiles
SET dietary_restrictions = (
    SELECT jsonb_agg(restriction)
    FROM (
        SELECT 'gluten' AS restriction WHERE gluten_free = true
        UNION ALL
        SELECT 'dairy' AS restriction WHERE lactose_free = true
    ) AS restrictions
)
WHERE dietary_restrictions = '[]'::jsonb OR dietary_restrictions IS NULL;
