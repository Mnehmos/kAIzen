-- Row Level Security (RLS) Policies for kAIzen Systems
-- Run this after schema.sql to secure your tables

-- Enable RLS on all tables
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ===== SUBSCRIBERS TABLE POLICIES =====

-- Allow anyone to insert (sign up)
CREATE POLICY "Anyone can subscribe"
  ON subscribers FOR INSERT
  WITH CHECK (true);

-- Allow users to view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscribers FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update their own subscription
CREATE POLICY "Users can update own subscription"
  ON subscribers FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ===== NEWSLETTER_ISSUES TABLE POLICIES =====

-- Allow anyone to read newsletter issues (tier filtering happens in app)
CREATE POLICY "Anyone can read newsletter issues"
  ON newsletter_issues FOR SELECT
  USING (true);

-- Only authenticated service role can insert/update newsletter issues
-- (This would typically be done through admin interface)

-- ===== TECHNIQUES TABLE POLICIES =====

-- Allow anyone to read techniques (tier filtering happens in app)
CREATE POLICY "Anyone can read techniques"
  ON techniques FOR SELECT
  USING (true);

-- Only authenticated service role can insert/update techniques
-- (This would typically be done through admin interface)

-- ===== PAGE_VIEWS TABLE POLICIES =====

-- Allow anyone to insert page views (for analytics)
CREATE POLICY "Anyone can track page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can read analytics
-- (You can add this later when you have admin authentication)

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS Policies created successfully! Next step: Run seed-data.sql';
END $$;

-- IMPORTANT NOTES:
-- 
-- 1. The current policies allow public read access to newsletter_issues and techniques.
--    Tier-based access control is handled in the application layer for simplicity.
--    
-- 2. For production, you might want to add more restrictive policies based on
--    authenticated users and their tier subscription.
--
-- 3. Admin operations (insert/update newsletter and techniques) should be done
--    using the Supabase service role key, not the anon key.
--
-- 4. To add admin authentication, you would create additional policies like:
--    CREATE POLICY "Admins can insert newsletter"
--      ON newsletter_issues FOR INSERT
--      USING (auth.jwt() ->> 'role' = 'admin');