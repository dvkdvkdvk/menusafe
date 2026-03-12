-- Migration: Add favorites, analytics, and sharing functionality

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  menu_item_name TEXT NOT NULL,
  menu_item_safety TEXT NOT NULL,
  menu_item_reason TEXT,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scan_id, menu_item_name)
);

-- Create user analytics table
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_scans INTEGER DEFAULT 0,
  total_items_analyzed INTEGER DEFAULT 0,
  safe_items_found INTEGER DEFAULT 0,
  caution_items_found INTEGER DEFAULT 0,
  unsafe_items_found INTEGER DEFAULT 0,
  favorite_restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  last_scan_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create scan analytics table for weekly/monthly aggregation
CREATE TABLE IF NOT EXISTS public.scan_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  scan_count INTEGER DEFAULT 0,
  items_analyzed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Add sharing columns to scans table
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS is_shareable BOOLEAN DEFAULT false;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT NULL;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ DEFAULT NULL;

-- Add onboarding and notification columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_cuisines TEXT[] DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_restaurant_id ON public.favorites(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_user_week ON public.scan_analytics(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_scans_share_token ON public.scans(share_token) WHERE share_token IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_analytics ENABLE ROW LEVEL SECURITY;

-- Favorites RLS policies
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- User analytics RLS policies
CREATE POLICY "user_analytics_select_own" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_analytics_insert_own" ON public.user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_analytics_update_own" ON public.user_analytics FOR UPDATE USING (auth.uid() = user_id);

-- Scan analytics RLS policies
CREATE POLICY "scan_analytics_select_own" ON public.scan_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scan_analytics_insert_own" ON public.scan_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scan_analytics_update_own" ON public.scan_analytics FOR UPDATE USING (auth.uid() = user_id);

-- Allow public access to shared scans (for the share feature)
CREATE POLICY "scans_select_shared" ON public.scans FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR (is_shareable = true AND share_token IS NOT NULL AND share_expires_at > now())
  );

-- Function to update user analytics after a scan
CREATE OR REPLACE FUNCTION update_user_analytics()
RETURNS TRIGGER AS $$
DECLARE
  safe_count INTEGER;
  caution_count INTEGER;
  unsafe_count INTEGER;
  items_count INTEGER;
  week_start_date DATE;
BEGIN
  -- Count items by safety level from the new scan
  SELECT 
    COUNT(*) FILTER (WHERE item->>'safety' = 'safe'),
    COUNT(*) FILTER (WHERE item->>'safety' = 'caution'),
    COUNT(*) FILTER (WHERE item->>'safety' = 'unsafe'),
    COUNT(*)
  INTO safe_count, caution_count, unsafe_count, items_count
  FROM jsonb_array_elements(NEW.menu_items) AS item;

  -- Upsert user analytics
  INSERT INTO public.user_analytics (user_id, total_scans, total_items_analyzed, safe_items_found, caution_items_found, unsafe_items_found, last_scan_at)
  VALUES (NEW.user_id, 1, items_count, safe_count, caution_count, unsafe_count, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_scans = user_analytics.total_scans + 1,
    total_items_analyzed = user_analytics.total_items_analyzed + items_count,
    safe_items_found = user_analytics.safe_items_found + safe_count,
    caution_items_found = user_analytics.caution_items_found + caution_count,
    unsafe_items_found = user_analytics.unsafe_items_found + unsafe_count,
    last_scan_at = now(),
    updated_at = now();

  -- Calculate week start (Monday)
  week_start_date := date_trunc('week', now())::DATE;

  -- Upsert scan analytics for the week
  INSERT INTO public.scan_analytics (user_id, week_start, scan_count, items_analyzed)
  VALUES (NEW.user_id, week_start_date, 1, items_count)
  ON CONFLICT (user_id, week_start) DO UPDATE SET
    scan_count = scan_analytics.scan_count + 1,
    items_analyzed = scan_analytics.items_analyzed + items_count;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for analytics update
DROP TRIGGER IF EXISTS trigger_update_analytics ON public.scans;
CREATE TRIGGER trigger_update_analytics
  AFTER INSERT ON public.scans
  FOR EACH ROW
  EXECUTE FUNCTION update_user_analytics();
