-- ============================================================
-- ReviewBoost – Feature Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Reply Templates
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reply_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reply_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates"
  ON reply_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 2. Feedback Submissions (from public funnel)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating              INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
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


-- 3. Widget: Allow anonymous reads of reviews
-- ─────────────────────────────────────────────────────────────
-- Only needed if your reviews table has RLS enabled.
-- Skip if you already have a public read policy.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reviews' AND policyname = 'Widget read'
  ) THEN
    EXECUTE 'CREATE POLICY "Widget read" ON reviews FOR SELECT TO anon USING (true)';
  END IF;
END $$;


-- 4. Indexes for performance
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reply_templates_user ON reply_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_owner ON feedback_submissions(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_submissions(created_at DESC);
