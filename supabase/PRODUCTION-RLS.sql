-- PRODUCTION-READY RLS Policies for kAIzen Systems
-- These policies balance security with public access needs

-- First, clean up any existing policies
DROP POLICY IF EXISTS "Public can subscribe" ON subscribers;
DROP POLICY IF EXISTS "Authenticated can read subscribers" ON subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscribers;
DROP POLICY IF EXISTS "Public read access for newsletters" ON newsletter_issues;
DROP POLICY IF EXISTS "Service role can manage newsletters" ON newsletter_issues;
DROP POLICY IF EXISTS "Public read access for techniques" ON techniques;
DROP POLICY IF EXISTS "Service role can manage techniques" ON techniques;
DROP POLICY IF EXISTS "Public can track page views" ON page_views;
DROP POLICY IF EXISTS "Service role can read analytics" ON page_views;

-- Enable RLS on all tables
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- ===== SUBSCRIBERS TABLE =====

-- Allow anyone (including anonymous) to insert new subscribers
CREATE POLICY "enable_insert_for_anon_users"
ON subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to read all subscribers (for admin purposes)
CREATE POLICY "enable_read_for_authenticated"
ON subscribers
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access
CREATE POLICY "enable_all_for_service_role"
ON subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ===== NEWSLETTER_ISSUES TABLE =====

-- Allow anyone to read newsletter issues (public content)
CREATE POLICY "enable_read_for_all"
ON newsletter_issues
FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- Only service role can modify content
CREATE POLICY "enable_write_for_service_role"
ON newsletter_issues
FOR INSERT, UPDATE, DELETE
TO service_role
USING (true)
WITH CHECK (true);

-- ===== TECHNIQUES TABLE =====

-- Allow anyone to read techniques (public content)
CREATE POLICY "enable_read_for_all"
ON techniques
FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- Only service role can modify content
CREATE POLICY "enable_write_for_service_role"
ON techniques
FOR INSERT, UPDATE, DELETE
TO service_role
USING (true)
WITH CHECK (true);

-- ===== PAGE_VIEWS TABLE =====

-- Allow anyone to insert analytics
CREATE POLICY "enable_insert_for_all"
ON page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only service role can read analytics
CREATE POLICY "enable_read_for_service_role"
ON page_views
FOR SELECT
TO service_role
USING (true);

-- ===== EMAIL_LOGS TABLE =====

-- Allow service role and triggers to manage email logs
CREATE POLICY "enable_all_for_service_role"
ON email_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ PRODUCTION RLS POLICIES CREATED!';
    RAISE NOTICE '';
    RAISE NOTICE 'What these policies allow:';
    RAISE NOTICE '';
    RAISE NOTICE 'ANONYMOUS USERS (anon key) can:';
    RAISE NOTICE '  ✓ Read all newsletter issues';
    RAISE NOTICE '  ✓ Read all techniques';
    RAISE NOTICE '  ✓ Insert new email subscribers';
    RAISE NOTICE '  ✓ Insert page view analytics';
    RAISE NOTICE '';
    RAISE NOTICE 'AUTHENTICATED USERS can:';
    RAISE NOTICE '  ✓ Everything anon users can do';
    RAISE NOTICE '  ✓ Read subscriber list (for admin)';
    RAISE NOTICE '';
    RAISE NOTICE 'SERVICE ROLE can:';
    RAISE NOTICE '  ✓ Full access to everything';
    RAISE NOTICE '  ✓ Insert/update newsletter issues';
    RAISE NOTICE '  ✓ Insert/update techniques';
    RAISE NOTICE '  ✓ Manage email logs';
    RAISE NOTICE '  ✓ Read analytics';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Your site should now work perfectly!';
    RAISE NOTICE 'Test it at: https://mnehmos.github.io/kAIzen/';
END $$;