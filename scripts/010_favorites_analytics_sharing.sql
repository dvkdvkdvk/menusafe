-- Migration: Add favorites, analytics, and sharing functionality (Phase 1: Tables and Columns)

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
