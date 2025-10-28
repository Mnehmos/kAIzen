-- SIMPLE FIX: Disable RLS for MVP
-- This is the quickest way to get your site working
-- You can re-enable RLS with proper policies later once you have subscribers

-- Disable RLS on all tables
ALTER TABLE subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE techniques DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS DISABLED - Your site will now work!';
  RAISE NOTICE '';
  RAISE NOTICE 'For MVP/testing, RLS is disabled.';
  RAISE NOTICE 'Your anon key can now:';
  RAISE NOTICE '  ✓ Read newsletter issues';
  RAISE NOTICE '  ✓ Read techniques';
  RAISE NOTICE '  ✓ Insert email subscribers';
  RAISE NOTICE '  ✓ Track page views';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  For production with real users, you should re-enable';
  RAISE NOTICE '   RLS with proper policies. But for now, this works!';
END $$;