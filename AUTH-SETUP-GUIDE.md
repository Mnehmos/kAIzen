# kAIzen Systems - Authentication Setup Guide

This guide will walk you through setting up the complete authentication system for kAIzen Systems, including Supabase Auth, Pro tier subscriptions, and Stripe payment integration.

## 📋 Overview

The authentication system includes:
- **Email/Password Authentication** - Simple signup and login
- **Session Management** - Persistent authentication across page loads
- **Pro Tier Gating** - Content access based on subscription tier
- **User Account Page** - Profile management and subscription status
- **Stripe Integration** - Payment processing for Pro upgrades
- **Row Level Security** - Database-level access control

## 🎯 What Was Created

### Database Components
- `supabase/auth-setup.sql` - Schema updates for authentication
- `supabase/AUTH-RLS.sql` - Row Level Security policies
- `supabase/edge-functions/stripe-webhook/` - Stripe webhook handler

### Frontend Components
- `js/auth.js` - Authentication module
- `account.html` - User account/profile page
- Updated `index.html`, `newsletter.html`, `techniques.html` - Login UI and content gating
- Updated `js/newsletter.js`, `js/techniques.js` - Pro content access control

## 🚀 Setup Instructions

### Step 1: Database Setup

1. **Run the authentication setup SQL**
   ```bash
   # In Supabase SQL Editor, run these in order:
   
   # First, run the main schema (if not already done)
   # Then run:
   website/supabase/auth-setup.sql
   
   # Finally, enable RLS:
   website/supabase/AUTH-RLS.sql
   ```

2. **Verify the setup**
   - Check that the `subscribers` table has a `user_id` column
   - Verify that RLS is enabled on all tables
   - Test that policies are active

### Step 2: Enable Supabase Email Authentication

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**

2. Enable **Email** provider:
   - Toggle "Enable Email provider" to ON
   - Configure email templates (optional):
     - Confirmation email
     - Reset password email
   - Set redirect URLs:
     - Site URL: `https://mnehmos.github.io/kAIzen/`
     - Redirect URLs: `https://mnehmos.github.io/kAIzen/**`

3. **Configure Email Settings** (Authentication → Settings):
   - Disable email confirmations for faster testing (enable for production)
   - Set password requirements (minimum 6 characters)
   - Configure session duration (default: 7 days)

### Step 3: Test Authentication (Before Stripe)

1. **Deploy your site** with the new auth files

2. **Test signup flow**:
   - Visit your site
   - Click "Login" → "Sign up"
   - Create an account with email/password
   - Verify you're redirected and logged in

3. **Test login flow**:
   - Logout
   - Click "Login"
   - Enter credentials
   - Verify you're logged in and see account button

4. **Test content gating**:
   - While logged in (Free tier), try to access Pro content
   - Should see "Upgrade to Pro" message
   - Free content should be accessible

5. **Test account page**:
   - Click your email in the nav to go to account page
   - Verify tier shows as "Free"
   - Test password change feature
   - Test logout

### Step 4: Stripe Setup

1. **Create a Stripe Account** (if you don't have one)
   - Go to [stripe.com](https://stripe.com)
   - Sign up and complete verification

2. **Create a Pro Subscription Product**:
   - Go to Stripe Dashboard → **Products**
   - Click "Add product"
   - Name: "kAIzen Pro Subscription"
   - Description: "Full access to kAIzen Systems Pro content"
   - Pricing: $9.00 / month (recurring)
   - Save the product

3. **Create a Payment Link or Checkout Session**:
   - Go to **Payment Links**
   - Create a new payment link for your Pro product
   - Configure:
     - Collect customer email
     - After payment, redirect to: `https://mnehmos.github.io/kAIzen/account.html?upgraded=true`
   - Copy the payment link URL

4. **Update pricing.html** with your payment link:
   ```html
   <a href="YOUR_STRIPE_PAYMENT_LINK" class="btn btn-primary">
     Upgrade to Pro
   </a>
   ```

### Step 5: Deploy Stripe Webhook (Edge Function)

1. **Get your Stripe keys**:
   - Stripe Dashboard → **Developers** → **API Keys**
   - Copy:
     - Publishable key (pk_test_...)
     - Secret key (sk_test_...)

2. **Deploy the Edge Function**:
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link your project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Set environment variables
   supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   
   # Deploy the function
   supabase functions deploy stripe-webhook
   ```

3. **Configure Stripe Webhook**:
   - Go to Stripe Dashboard → **Developers** → **Webhooks**
   - Click "Add endpoint"
   - Endpoint URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret (whsec_...)
   - Update the secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET`

### Step 6: Test Complete Flow

1. **Test Pro Upgrade**:
   - Login to your site
   - Go to account page
   - Click "Upgrade to Pro" → redirects to Stripe
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete payment
   - Verify webhook processes successfully
   - Return to site and verify tier is now "Pro"

2. **Test Pro Content Access**:
   - Navigate to a Pro newsletter article
   - Verify you can now see the full content
   - Navigate to a Pro technique
   - Verify you can see the full specification

3. **Test as different users**:
   - Logout
   - Create another account (stays Free tier)
   - Verify Pro content is still locked
   - Verify Free content is accessible

## 🔧 Configuration Files

### Environment Variables Needed

For local development, create a `.env.local` file:
```env
# Supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (for webhook)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### Supabase Secrets (for Edge Functions)
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👥 User Flows

### New User Signup & Free Access
1. User visits site → sees free content
2. Clicks "Login" → "Sign up"
3. Creates account with email/password
4. Automatically logged in with Free tier
5. Can access free content, sees upgrade prompts on Pro content

### Pro Upgrade Flow
1. Free user clicks "Upgrade to Pro"
2. Redirects to Stripe Checkout
3. Enters payment information
4. Completes purchase
5. Stripe webhook fires → updates user to Pro tier
6. Returns to site → now has Pro access
7. Can view all Pro content

### Returning User
1. User visits site
2. Auto-authenticated if session exists
3. Navigation shows email and tier
4. Can access content based on tier

## 🐛 Troubleshooting

### Issue: "User not authenticated" after signup
**Solution**: 
- Check Supabase email confirmation settings
- Disable email confirmation for testing
- Verify redirect URLs are configured correctly

### Issue: Pro content still locked after payment
**Solution**:
- Check Stripe webhook logs in Supabase
- Verify webhook secret is correct
- Check `subscribers` table - tier should be 'pro'
- Verify email matches between Stripe and Supabase

### Issue: RLS policies blocking content
**Solution**:
- Check that RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Verify policies exist: Query `pg_policies` table
- Test with service_role key to bypass RLS temporarily
- Check that user_id is set in subscribers table

### Issue: Can't update to Pro tier
**Solution**:
- Verify Edge Function is deployed: `supabase functions list`
- Check function logs: `supabase functions logs stripe-webhook`
- Verify Stripe webhook is receiving events (check Stripe Dashboard)
- Test webhook locally: Use Stripe CLI `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`

### Issue: Session not persisting
**Solution**:
- Check browser localStorage for Supabase session
- Verify `auth.js` is loaded on every page
- Check for JavaScript errors in console
- Ensure `supabase-init.js` loads before `auth.js`

## 📊 Database Queries for Debugging

### Check user's tier
```sql
SELECT email, tier, user_id, stripe_customer_id 
FROM subscribers 
WHERE email = 'user@example.com';
```

### Check all Pro users
```sql
SELECT email, tier, subscribed_at 
FROM subscribers 
WHERE tier = 'pro';
```

### Link existing subscriber to auth user
```sql
UPDATE subscribers 
SET user_id = 'user-uuid-from-auth-users'
WHERE email = 'user@example.com';
```

### Check RLS policies
```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## 🔐 Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Use environment variables** for all sensitive data
3. **Enable RLS** on all tables containing user data
4. **Test policies** thoroughly before production
5. **Use HTTPS** for all production deployments
6. **Rotate keys** regularly
7. **Monitor webhook logs** for suspicious activity
8. **Set up rate limiting** on authentication endpoints

## 🎉 Success Checklist

- [ ] Database schema updated with auth-setup.sql
- [ ] RLS policies enabled with AUTH-RLS.sql
- [ ] Supabase Email Auth enabled
- [ ] Users can sign up and login
- [ ] Sessions persist across page loads
- [ ] Free content accessible to all users
- [ ] Pro content locked for free users
- [ ] Account page displays correct tier
- [ ] Stripe product created
- [ ] Payment link configured
- [ ] Stripe webhook deployed
- [ ] Webhook successfully processes payments
- [ ] Pro upgrade flow works end-to-end
- [ ] Pro users can access Pro content
- [ ] All pages have auth UI

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🆘 Getting Help

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console for JavaScript errors
3. Check Stripe webhook logs
4. Review this guide's troubleshooting section
5. Check Supabase Discord community

---

**Congratulations!** 🎊 You now have a fully functional authentication system with Pro tier subscriptions. Your users can sign up, login, and upgrade to Pro to access exclusive content.