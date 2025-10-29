-- kAIzen Systems - Authentication-Aware RLS Policies
-- Run this AFTER auth-setup.sql to enable Row Level Security with authentication

-- ============================================
-- STEP 1: Enable RLS on all tables
-- ============================================

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Subscribers Table Policies
-- ============================================

-- Policy: Users can read their own subscriber record
CREATE POLICY "Users can view own subscriber data"
ON subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their own subscriber record (for metadata, etc.)
CREATE POLICY "Users can update own subscriber data"
ON subscribers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do anything (for webhooks, admin operations)
CREATE POLICY "Service role has full access to subscribers"
ON subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Anonymous users can insert (for email signups before auth)
CREATE POLICY "Anonymous users can subscribe"
ON subscribers
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- ============================================
-- STEP 3: Newsletter Issues Policies
-- ============================================

-- Policy: Everyone can read free newsletter issues
CREATE POLICY "Anyone can view free newsletters"
ON newsletter_issues
FOR SELECT
TO authenticated, anon
USING (tier_required = 'free');

-- Policy: Pro users can read Pro newsletter issues
CREATE POLICY "Pro users can view Pro newsletters"
ON newsletter_issues
FOR SELECT
TO authenticated
USING (
  tier_required = 'pro' 
  AND EXISTS (
    SELECT 1 FROM subscribers 
    WHERE user_id = auth.uid() 
    AND tier = 'pro'
  )
);

-- Policy: Service role has full access (for seeding, admin)
CREATE POLICY "Service role has full access to newsletters"
ON newsletter_issues
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 4: Techniques Table Policies
-- ============================================

-- Policy: Everyone can read free techniques
CREATE POLICY "Anyone can view free techniques"
ON techniques
FOR SELECT
TO authenticated, anon
USING (tier_required = 'free');

-- Policy: Pro users can read Pro techniques
CREATE POLICY "Pro users can view Pro techniques"
ON techniques
FOR SELECT
TO authenticated
USING (
  tier_required = 'pro' 
  AND EXISTS (
    SELECT 1 FROM subscribers 
    WHERE user_id = auth.uid() 
    AND tier = 'pro'
  )
);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to techniques"
ON techniques
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 5: Page Views (Analytics) Policies
-- ============================================

-- Policy: Anyone can insert page views (for tracking)
CREATE POLICY "Anyone can track page views"
ON page_views
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Policy: Service role can read analytics
CREATE POLICY "Service role can read analytics"
ON page_views
FOR SELECT
TO service_role
USING (true);

-- ============================================
-- STEP 6: Helper Functions for Access Control
-- ============================================

-- Function: Check if current user has Pro access
CREATE OR REPLACE FUNCTION public.user_has_pro_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.subscribers 
    WHERE user_id = auth.uid() 
    AND tier = 'pro'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.user_has_pro_access() TO authenticated;

-- Function: Get current user's tier
CREATE OR REPLACE FUNCTION public.get_user_tier()
RETURNS TEXT AS $$
DECLARE
  user_tier TEXT;
BEGIN
  SELECT tier INTO user_tier
  FROM public.subscribers
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_tier() TO authenticated;

-- ============================================
-- STEP 7: Verify Policies
-- ============================================

-- View all policies
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS Policies Summary:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Subscribers table:';
  RAISE NOTICE '  - Users can view/update own data';
  RAISE NOTICE '  - Anonymous can insert (email signup)';
  RAISE NOTICE '  - Service role has full access';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Newsletter Issues table:';
  RAISE NOTICE '  - Free content: public access';
  RAISE NOTICE '  - Pro content: requires Pro tier';
  RAISE NOTICE '  - Service role has full access';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Techniques table:';
  RAISE NOTICE '  - Free content: public access';
  RAISE NOTICE '  - Pro content: requires Pro tier';
  RAISE NOTICE '  - Service role has full access';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Page Views table:';
  RAISE NOTICE '  - Anyone can insert (tracking)';
  RAISE NOTICE '  - Service role can read analytics';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Helper Functions:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ user_has_pro_access() - Check Pro status';
  RAISE NOTICE '✓ get_user_tier() - Get current user tier';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Authentication Setup Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Test authentication flow in your app';
  RAISE NOTICE '2. Configure Stripe webhook endpoint';
  RAISE NOTICE '3. Deploy Edge Function for webhooks';
  RAISE NOTICE '4. Test Pro upgrade flow';
  RAISE NOTICE '';
END $$;