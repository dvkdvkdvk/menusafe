-- Migration: Create analytics tables
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

CREATE TABLE IF NOT EXISTS public.scan_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  scan_count INTEGER DEFAULT 0,
  items_analyzed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_user_week ON public.scan_analytics(user_id, week_start);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_analytics_select_own" ON public.user_analytics;
DROP POLICY IF EXISTS "user_analytics_insert_own" ON public.user_analytics;
DROP POLICY IF EXISTS "user_analytics_update_own" ON public.user_analytics;

CREATE POLICY "user_analytics_select_own" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_analytics_insert_own" ON public.user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_analytics_update_own" ON public.user_analytics FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "scan_analytics_select_own" ON public.scan_analytics;
DROP POLICY IF EXISTS "scan_analytics_insert_own" ON public.scan_analytics;
DROP POLICY IF EXISTS "scan_analytics_update_own" ON public.scan_analytics;

CREATE POLICY "scan_analytics_select_own" ON public.scan_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scan_analytics_insert_own" ON public.scan_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scan_analytics_update_own" ON public.scan_analytics FOR UPDATE USING (auth.uid() = user_id);
