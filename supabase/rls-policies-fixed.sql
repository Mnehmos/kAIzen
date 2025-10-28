-- FIXED Row Level Security Policies for kAIzen Systems
-- This version ensures anonymous users can read content

-- First, disable RLS temporarily to clean up
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE techniques DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscribers;
DROP POLICY IF EXISTS "Anyone can read newsletter issues" ON newsletter_issues;
DROP POLICY IF EXISTS "Anyone can read techniques" ON techniques;
DROP POLICY IF EXISTS "Anyone can track page views" ON page_views;

-- Re-enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ===== SUBSCRIBERS TABLE POLICIES =====

-- Allow anonymous users to insert (sign up)
CREATE POLICY "Public can subscribe"
  ON subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read
CREATE POLICY "Authenticated can read subscribers"
  ON subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- ===== NEWSLETTER_ISSUES TABLE POLICIES =====

-- Allow EVERYONE (including anonymous) to read all newsletter issues
CREATE POLICY "Public read access for newsletters"
  ON newsletter_issues
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role to manage content
CREATE POLICY "Service role can manage newsletters"
  ON newsletter_issues
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ===== TECHNIQUES TABLE POLICIES =====

-- Allow EVERYONE (including anonymous) to read all techniques
CREATE POLICY "Public read access for techniques"
  ON techniques
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow service role to manage content
CREATE POLICY "Service role can manage techniques"
  ON techniques
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ===== PAGE_VIEWS TABLE POLICIES =====

-- Allow anonymous users to insert analytics
CREATE POLICY "Public can track page views"
  ON page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow service role to read analytics
CREATE POLICY "Service role can read analytics"
  ON page_views
  FOR SELECT
  TO service_role
  USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies created successfully!';
  RAISE NOTICE '✅ Anonymous users can now:';
  RAISE NOTICE '   - Read newsletter issues';
  RAISE NOTICE '   - Read techniques';
  RAISE NOTICE '   - Subscribe via email';
  RAISE NOTICE '   - Track page views';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run seed-data.sql to populate content';
END $$;