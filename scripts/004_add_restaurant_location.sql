-- Add lat/lng columns to restaurants table for Google Maps navigation
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Add safety_score column for ranking (computed from scans)
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS safety_score INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_restaurants_user_safety ON public.restaurants(user_id, safety_score DESC);
