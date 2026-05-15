-- ============================================================
-- ReviewBoost — Consolidated Database Setup (idempotent)
-- Run this entire file in your Supabase SQL Editor
-- ============================================================


-- ============================================================
-- SECTION 1: Reviews Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name text NOT NULL,
  platform text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL,
  responded boolean DEFAULT false NOT NULL,
  response_text text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS response_text text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS business_id uuid;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Widget read" ON public.reviews;

CREATE POLICY "Users can view own reviews"
  ON public.reviews FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Widget read"
  ON public.reviews FOR SELECT TO anon USING (true);


-- ============================================================
-- SECTION 2: Businesses Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address text,
  place_id text,
  google_maps_url text,
  google_review_url text,
  phone text,
  website text,
  rating numeric(2,1),
  total_ratings integer,
  photo_url text,
  chain_name text,
  is_chain_member boolean DEFAULT false,
  logo_url text,
  brand_color text,
  category text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS brand_color text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can insert own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can delete own businesses" ON public.businesses;

CREATE POLICY "Users can view own businesses"
  ON public.businesses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own businesses"
  ON public.businesses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses"
  ON public.businesses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses"
  ON public.businesses FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- SECTION 3: Reply Templates
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reply_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own templates" ON public.reply_templates;

CREATE POLICY "Users manage own templates"
  ON public.reply_templates FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- SECTION 4: Feedback Submissions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public funnel insert" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Owners read own feedback" ON public.feedback_submissions;

CREATE POLICY "Public funnel insert"
  ON public.feedback_submissions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Owners read own feedback"
  ON public.feedback_submissions FOR SELECT TO authenticated
  USING (auth.uid() = business_owner_id);


-- ============================================================
-- SECTION 5: Delivery Platform Ratings
-- ============================================================

CREATE TABLE IF NOT EXISTS public.delivery_platform_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  rating DECIMAL(3,1),
  review_count INT,
  restaurant_name TEXT,
  checked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.delivery_platform_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own delivery ratings" ON public.delivery_platform_ratings;

CREATE POLICY "Users manage own delivery ratings"
  ON public.delivery_platform_ratings FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- SECTION 6: Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_templates_user ON public.reply_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_owner ON public.feedback_submissions(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_delivery_ratings_user ON public.delivery_platform_ratings(user_id, checked_at DESC);
