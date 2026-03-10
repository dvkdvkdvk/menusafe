-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Restaurants RLS policies
CREATE POLICY "restaurants_select_own" ON public.restaurants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "restaurants_insert_own" ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "restaurants_update_own" ON public.restaurants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "restaurants_delete_own" ON public.restaurants FOR DELETE USING (auth.uid() = user_id);

-- Scans RLS policies
CREATE POLICY "scans_select_own" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scans_insert_own" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scans_update_own" ON public.scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "scans_delete_own" ON public.scans FOR DELETE USING (auth.uid() = user_id);
