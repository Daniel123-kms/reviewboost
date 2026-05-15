-- Create delivery_platform_ratings table
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

CREATE INDEX idx_delivery_ratings_user_checked ON delivery_platform_ratings(user_id, checked_at DESC);
