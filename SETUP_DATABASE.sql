-- ============================================================
-- ReviewBoost — Consolidated Database Setup
-- Run this entire file in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================


-- ============================================================
-- SECTION 1: Reviews Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('Google', 'Tripadvisor', 'Booking.com', 'Yelp', 'Facebook', 'Lieferando', 'Foodora')),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL,
  responded boolean DEFAULT false NOT NULL,
  response_text text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);


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
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own businesses"
  ON public.businesses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own businesses"
  ON public.businesses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses"
  ON public.businesses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses"
  ON public.businesses FOR DELETE USING (auth.uid() = user_id);

-- Link reviews to businesses
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL;


-- ============================================================
-- SECTION 3: Reply Templates
-- ============================================================

CREATE TABLE IF NOT EXISTS reply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reply_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates"
  ON reply_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- SECTION 4: Feedback Submissions (public funnel)
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors can insert (public funnel)
CREATE POLICY "Public funnel insert"
  ON feedback_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Business owners can read their own submissions
CREATE POLICY "Owners read own feedback"
  ON feedback_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = business_owner_id);


-- ============================================================
-- SECTION 5: Widget — allow anonymous reads of reviews
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reviews' AND policyname = 'Widget read'
  ) THEN
    EXECUTE 'CREATE POLICY "Widget read" ON reviews FOR SELECT TO anon USING (true)';
  END IF;
END $$;


-- ============================================================
-- SECTION 6: Delivery Platform Ratings
-- ============================================================

CREATE TABLE IF NOT EXISTS delivery_platform_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  rating DECIMAL(3,1),
  review_count INT,
  restaurant_name TEXT,
  checked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform, checked_at::date)
);


-- ============================================================
-- SECTION 7: Indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_reply_templates_user ON reply_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_owner ON feedback_submissions(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_ratings_user_checked ON delivery_platform_ratings(user_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user ON public.businesses(user_id);

-- Run this entire file in your Supabase SQL Editor (https://supabase.com/dashboard)
