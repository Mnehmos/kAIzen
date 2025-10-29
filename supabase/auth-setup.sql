-- kAIzen Systems - Authentication Setup
-- This script adds Supabase Auth integration to the existing schema
-- Run this AFTER the main schema.sql has been executed

-- Step 1: Add user_id column to subscribers table to link with auth.users
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);

-- Step 3: Make email nullable for future flexibility (users might not have email in some auth flows)
-- Note: We keep NOT NULL for now since we rely on email, but this is a future consideration
-- ALTER TABLE subscribers ALTER COLUMN email DROP NOT NULL;

-- Step 4: Create a function to automatically create a subscriber record when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new subscriber record for the new user
  INSERT INTO public.subscribers (user_id, email, tier, subscribed_at)
  VALUES (NEW.id, NEW.email, 'free', NOW())
  ON CONFLICT (email) DO UPDATE
  SET user_id = NEW.id,
      updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Create a function to link existing email subscribers to new auth accounts
CREATE OR REPLACE FUNCTION public.link_subscriber_to_user(user_email TEXT, auth_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  -- Update the subscriber record to link it with the auth user
  UPDATE public.subscribers
  SET user_id = auth_user_id,
      updated_at = NOW()
  WHERE email = user_email
    AND user_id IS NULL;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  RETURN rows_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.subscribers TO authenticated;
GRANT ALL ON public.newsletter_issues TO authenticated;
GRANT ALL ON public.techniques TO authenticated;

-- Step 8: Create a view for user profile information
CREATE OR REPLACE VIEW public.user_profile AS
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created_at,
  s.tier,
  s.stripe_customer_id,
  s.subscribed_at,
  s.metadata
FROM auth.users u
LEFT JOIN public.subscribers s ON u.id = s.user_id;

-- Grant access to the view
GRANT SELECT ON public.user_profile TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Authentication setup completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run AUTH-RLS.sql to set up Row Level Security policies';
  RAISE NOTICE '2. Test authentication in your application';
  RAISE NOTICE '3. Configure Stripe webhook for payment processing';
END $$;