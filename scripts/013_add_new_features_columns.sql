-- Add columns to profiles table for new features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS favorites JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scan_analytics JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS completed_onboarding BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;

-- Add columns to scans table for sharing
ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS is_shareable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_share_token ON public.scans(share_token);
CREATE INDEX IF NOT EXISTS idx_scans_is_shareable ON public.scans(is_shareable);
