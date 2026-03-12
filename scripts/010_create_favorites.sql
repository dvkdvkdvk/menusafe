-- Migration: Create favorites table
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

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_restaurant_id ON public.favorites(restaurant_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;

CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);
