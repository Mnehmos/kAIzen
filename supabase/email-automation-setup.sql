-- Email Automation Setup for kAIzen Systems
-- This creates a database trigger to send welcome emails to new subscribers

-- ===== STEP 1: Create email log table =====
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES subscribers(id),
    email TEXT NOT NULL,
    email_type TEXT NOT NULL, -- 'welcome', 'newsletter', 'pro_upgrade'
    sent_at TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX idx_email_logs_subscriber ON email_logs(subscriber_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- ===== STEP 2: Create function to queue welcome emails =====
CREATE OR REPLACE FUNCTION queue_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert email to queue
    INSERT INTO email_logs (subscriber_id, email, email_type, metadata)
    VALUES (
        NEW.id,
        NEW.email,
        'welcome',
        jsonb_build_object(
            'tier', NEW.tier,
            'subscribed_at', NEW.subscribed_at
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== STEP 3: Create trigger on new subscribers =====
DROP TRIGGER IF EXISTS on_subscriber_created ON subscribers;
CREATE TRIGGER on_subscriber_created
    AFTER INSERT ON subscribers
    FOR EACH ROW
    EXECUTE FUNCTION queue_welcome_email();

-- ===== STEP 4: Enable Supabase Edge Function (You'll create this next) =====
-- The Edge Function will:
-- 1. Monitor email_logs for status='pending'
-- 2. Send emails via HTTP endpoint
-- 3. Update status to 'sent' or 'failed'

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Email automation database setup complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'What was created:';
    RAISE NOTICE '  ✓ email_logs table for tracking';
    RAISE NOTICE '  ✓ queue_welcome_email() function';
    RAISE NOTICE '  ✓ Trigger on new subscribers';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Create Supabase Edge Function to send emails';
    RAISE NOTICE '  2. Configure SMTP settings or use Resend/SendGrid';
    RAISE NOTICE '  3. Test with a new subscriber signup';
    RAISE NOTICE '';
    RAISE NOTICE 'For now, check email_logs table after signups to see queued emails!';
END $$;