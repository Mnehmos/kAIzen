# Email Automation Setup for kAIzen Systems

## Overview

This guide shows you how to set up automated welcome emails for new subscribers using Supabase Edge Functions and Resend API.

**Cost:** Free for up to 100 emails/day with Resend
**Time:** 15 minutes
**Skill Level:** Beginner-friendly with step-by-step instructions

---

## Option 1: Quick & Free with Resend (Recommended)

### Step 1: Create Resend Account (5 minutes)

1. Go to: https://resend.com/signup
2. Sign up with GitHub or email
3. Verify your email address
4. You get **100 emails/day free** (perfect for MVP!)

### Step 2: Get API Key (2 minutes)

1. In Resend dashboard, click **"API Keys"**
2. Click **"Create API Key"**
3. Name it: "kAIzen Production"
4. Click **"Add"**
5. **Copy the key** (starts with `re_`)
6. Save it somewhere secure!

### Step 3: Verify Your Domain (Optional but Recommended)

1. In Resend, click **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (or use `resend.dev` for testing)
4. Follow DNS setup instructions
5. Wait for verification (5-10 minutes)

### Step 4: Set Up Database Trigger (3 minutes)

In Supabase SQL Editor, run:
[`email-automation-setup.sql`](email-automation-setup.sql)

This creates:
- `email_logs` table for tracking
- Trigger function to queue emails
- Automatic queueing on new subscribers

### Step 5: Deploy Edge Function (5 minutes)

**Install Supabase CLI:**
```bash
npm install -g supabase
```

**Login to Supabase:**
```bash
supabase login
```

**Link your project:**
```bash
supabase link --project-ref gotgnbwiodwkrsdmighy
```

**Set secret for Resend API:**
```bash
supabase secrets set RESEND_API_KEY=re_your_actual_key_here
```

**Deploy the function:**
```bash
cd website/supabase/edge-functions
supabase functions deploy send-welcome-email
```

### Step 6: Set Up Cron Job (2 minutes)

In Supabase dashboard:
1. Go to **"Database"** → **"Cron Jobs"** (pg_cron extension)
2. Click **"Create a new cron job"**
3. Schedule: `*/5 * * * *` (every 5 minutes)
4. SQL:
```sql
SELECT net.http_post(
    url:='https://gotgnbwiodwkrsdmighy.supabase.co/functions/v1/send-welcome-email',
    headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
) as request_id;
```
5. Click **"Save"**

**Done!** New subscribers automatically get welcome emails within 5 minutes.

---

## Option 2: Even Simpler - Zapier/Make Integration

### Using Zapier (No Code)

1. Create free Zapier account
2. Create new Zap:
   - **Trigger:** Supabase - New Row in subscribers table
   - **Action:** Gmail/Outlook - Send Email
3. Configure email template
4. Turn on Zap

**Pros:** No coding, visual interface
**Cons:** Limited to 100 tasks/month on free plan

---

## Production-Ready RLS Policies

### Current State: RLS Disabled

Your site works because we disabled RLS. This is **fine for MVP** but you should enable proper policies when ready.

### To Enable Secure RLS (When Ready)

Run [`PRODUCTION-RLS.sql`](PRODUCTION-RLS.sql) in Supabase SQL Editor.

This creates policies that:
- ✅ Allow anonymous users to read content
- ✅ Allow anonymous users to subscribe
- ✅ Allow anonymous users to track analytics
- ✅ Prevent unauthorized data modification
- ✅ Give admins full control via service role

**When to enable:**
- You have paying Pro subscribers
- You're collecting sensitive data
- You need audit trails
- You want extra security

**For now with humble beginnings:** RLS disabled is perfectly acceptable!

---

## Email Template Examples

### Welcome Email (Free Tier)
```
Subject: 🎉 Welcome to kAIzen Systems!

Hi there!

Thanks for subscribing to kAIzen Systems - your weekly source for tested AI workflow optimization techniques.

You now have access to:
✅ Weekly newsletter with 1-2 proven techniques
✅ Technique library with performance benchmarks
✅ Community resources and discussions

Our latest articles:
📝 Standard Operating Procedures for Stateless Multi-Agent Systems
📝 Self-Reflection Loop: Meta-Cognitive Quality Assurance
📝 Hierarchical Task Decomposition

Want full access to our complete archive and premium techniques?
Upgrade to Pro: https://mnehmos.github.io/kAIzen/pricing.html

Cheers,
The kAIzen Team

P.S. Reply to this email if you have questions - we read every message!
```

### Upgrade to Pro Confirmation
```
Subject: 🚀 Welcome to kAIzen Pro!

Hi there!

You're now a Pro subscriber - thank you for your support!

Your Pro benefits:
✅ Full newsletter archive access
✅ Complete technique library  
✅ Advanced implementation guides
✅ Performance benchmarks
✅ Early access to MCP tools
✅ Priority email support

Browse your Pro content:
https://mnehmos.github.io/kAIzen/

Questions? Just reply to this email.

Welcome to the Pro community!
The kAIzen Team
```

---

## Testing Email Automation

### Manual Test

1. Go to Supabase → Table Editor → email_logs
2. You should see queued emails from your test signups
3. Manually trigger the Edge Function:
```bash
curl -X POST https://gotgnbwiodwkrsdmighy.supabase.co/functions/v1/send-welcome-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```
4. Check email_logs table - status should change to 'sent'
5. Check your inbox for the welcome email!

---

## Cost Breakdown

### Free Tier (Recommended for Starting)

**Resend:** 100 emails/day free
**Supabase:** Free tier (up to 50,000 monthly active users)
**GitHub Pages:** Free hosting
**Total:** $0/month for up to 3,000 subscribers/month

### When You Outgrow Free

**Resend Pro:** $20/month (50,000 emails/month)
**Supabase Pro:** $25/month (better performance)
**Total:** $45/month operational cost

**Break-even:** 3 Pro subscribers ($19 × 3 = $57)

---

## Troubleshooting

**Emails not sending?**
- Check email_logs table for error messages
- Verify Resend API key is correct
- Check Resend dashboard for rate limits
- Ensure domain is verified in Resend

**Emails going to spam?**
- Verify your sending domain
- Add SPF/DKIM records
- Use professional email content
- Avoid spam trigger words

**Edge Function timing out?**
- Reduce batch size from 10 to 5
- Check Supabase function logs
- Verify Resend API is responding

---

## Summary

**MVP Setup (What you have now):**
- ✅ Emails save to database
- ✅ You can manually email first subscribers
- ⏳ Automation available when you're ready

**Full Automation (15 minutes to set up):**
1. Create Resend account
2. Run email-automation-setup.sql
3. Deploy Edge Function
4. Set up cron job
5. Test!

**For humble beginnings:** Manual emails are fine for your first 10-20 subscribers. Add automation when you're collecting 5+ signups per day.

---

**Start with manual, automate when needed!** 🚀