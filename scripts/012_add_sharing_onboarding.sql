-- Migration: Add sharing and onboarding columns
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS is_shareable BOOLEAN DEFAULT false;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT NULL;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_cuisines TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_scans_share_token ON public.scans(share_token) WHERE share_token IS NOT NULL;
