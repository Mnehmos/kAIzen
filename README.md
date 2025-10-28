# kAIzen Systems Website + Supabase Integration

A humble-beginnings MVP website with database-backed email subscriptions, newsletter archive, and technique library browser.

## 🎯 What's Built

- ✅ **Static HTML/CSS/JS Website** - No complex frameworks, just clean modern design
- ✅ **Supabase Database Integration** - Full CRUD operations without backend code
- ✅ **Email Signup System** - Newsletter subscription with tier management
- ✅ **Newsletter Archive** - Display and browse all published newsletter issues
- ✅ **Technique Library** - Searchable, filterable library of prompt engineering techniques
- ✅ **Pricing Page** - Free and Pro tiers with Stripe integration ready
- ✅ **Responsive Design** - Mobile-friendly across all pages

## 📁 Project Structure

```
website/
├── index.html              # Landing page
├── newsletter.html         # Newsletter archive
├── techniques.html         # Technique library browser
├── pricing.html            # Pricing tiers
├── css/
│   ├── main.css           # Global styles
│   └── components.css     # Reusable components
├── js/
│   ├── supabase-client.js # Supabase initialization
│   ├── home.js            # Homepage logic
│   ├── newsletter.js      # Newsletter archive logic
│   ├── techniques.js      # Technique browser logic
│   └── modal.js           # Modal functionality
├── supabase/
│   ├── schema.sql         # Database schema
│   ├── rls-policies.sql   # Row Level Security
│   └── seed-data.sql      # Sample data
└── README.md              # This file
```

## 🚀 Quick Start

### Step 1: Set Up Supabase Project

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Configure Database**
   - Go to SQL Editor in Supabase Dashboard
   - Run the SQL files in order:
     ```sql
     -- 1. Create tables
     -- Copy and paste contents of supabase/schema.sql
     
     -- 2. Set up security
     -- Copy and paste contents of supabase/rls-policies.sql
     
     -- 3. Add sample data
     -- Copy and paste contents of supabase/seed-data.sql
     ```

3. **Get API Keys**
   - Go to Project Settings → API
   - Copy your:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **Anon/Public Key** (safe for browser use)

### Step 2: Configure Website

1. **Update Supabase Client**
   
   Edit `js/supabase-client.js`:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```

2. **Add Supabase JavaScript Library**
   
   Add this before the closing `</body>` tag in ALL HTML files:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```

3. **Configure Stripe (Optional)**
   
   In `pricing.html`, replace the Stripe checkout URL:
   ```html
   <form action="https://checkout.stripe.com/YOUR_STRIPE_LINK" method="POST">
   ```

### Step 3: Test Locally

1. **Serve the Website**
   
   You need a local web server (not just opening HTML files):
   
   **Option A: Using Python**
   ```bash
   cd website
   python -m http.server 8000
   ```
   
   **Option B: Using Node.js**
   ```bash
   npm install -g http-server
   cd website
   http-server
   ```
   
   **Option C: VS Code Live Server**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

2. **Test Features**
   - ✅ Homepage loads with latest newsletter issues
   - ✅ Email signup form works (check Supabase dashboard)
   - ✅ Newsletter archive displays all issues
   - ✅ Technique library is searchable/filterable
   - ✅ Mobile responsive design works

### Step 4: Deploy to Production

#### Option A: GitHub Pages (Free, Easy)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: kAIzen Systems MVP"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kaizen-website.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` → `/website` folder
   - Save

3. **Access Your Site**
   - Your site will be at: `https://YOUR_USERNAME.github.io/kaizen-website/`
   - May take a few minutes to deploy

#### Option B: Netlify (Free, Advanced)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   cd website
   netlify deploy
   ```
   
   - Follow prompts to create new site
   - For production: `netlify deploy --prod`

3. **Custom Domain (Optional)**
   - Go to Netlify dashboard → Domain settings
   - Add custom domain: `kaizen.systems`
   - Follow DNS configuration instructions

#### Option C: Vercel (Free, Fast)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd website
   vercel
   ```
   
   - Follow prompts
   - For production: `vercel --prod`

## 💳 Stripe Integration

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account and complete verification
3. Go to Products → Add Product:
   - Name: "kAIzen Systems Pro"
   - Price: $19/month recurring

### Step 2: Create Payment Link

1. In Stripe Dashboard → Payment Links
2. Create new payment link for Pro product
3. Configure:
   - Success URL: `https://yourdomain.com/success.html`
   - Cancel URL: `https://yourdomain.com/pricing.html`
4. Copy the payment link URL

### Step 3: Update Website

In `pricing.html`, replace:
```html
<form action="YOUR_STRIPE_PAYMENT_LINK_HERE" method="POST">
```

### Step 4: Handle Webhooks (Optional)

For automatic tier upgrades, set up Stripe webhooks:

1. **In Stripe Dashboard:**
   - Developers → Webhooks → Add endpoint
   - Endpoint URL: `https://yourdomain.com/api/stripe-webhook`
   - Events: `checkout.session.completed`

2. **Create Webhook Handler** (requires backend)
   - Use Supabase Edge Functions or Netlify Functions
   - Update subscriber tier in database when payment succeeds

## 🔒 Security Considerations

### Supabase RLS Policies

The provided RLS policies allow:
- ✅ Anyone can subscribe (insert to `subscribers`)
- ✅ Anyone can read newsletters and techniques
- ✅ Anyone can track page views
- ❌ Only admins can insert/update content (use service role key)

### API Keys

- **Anon Key:** Safe to use in browser (public)
- **Service Role Key:** NEVER expose in browser (admin only)

### CORS

Supabase automatically handles CORS. No additional configuration needed.

## 📊 Database Schema

### Tables

1. **subscribers** - Email subscriptions with tier management
2. **newsletter_issues** - Newsletter content with markdown
3. **techniques** - Technique library with JSON specs
4. **page_views** - Simple analytics tracking

### Key Features

- ✅ UUID primary keys for all tables
- ✅ Timestamps for created_at/updated_at
- ✅ JSONB for flexible metadata storage
- ✅ Array fields for relationships
- ✅ Indexes on frequently queried columns

## 🎨 Customization

### Colors & Branding

Edit `css/main.css`:
```css
:root {
    --primary-color: #2563eb;      /* Main brand color */
    --primary-hover: #1d4ed8;      /* Hover state */
    --success-color: #22c55e;      /* Success messages */
    /* ... */
}
```

### Logo

1. Add your logo to `assets/logo.svg` or `assets/logo.png`
2. Update navigation in all HTML files:
   ```html
   <div class="nav-logo">
       <img src="assets/logo.svg" alt="kAIzen Systems">
   </div>
   ```

### Content

- **Newsletter Issues:** Add to Supabase `newsletter_issues` table
- **Techniques:** Add to Supabase `techniques` table
- **Static Pages:** Edit HTML files directly

## 🐛 Troubleshooting

### Supabase Connection Issues

**Problem:** "Database connection not available"

**Solutions:**
1. Check API keys are correct in `supabase-client.js`
2. Verify Supabase CDN script is included in HTML
3. Check browser console for CORS errors
4. Ensure Supabase project is not paused (free tier)

### Email Signup Not Working

**Problem:** Form submits but nothing happens

**Solutions:**
1. Check Supabase connection
2. Verify RLS policies allow INSERT on `subscribers`
3. Check for duplicate emails (unique constraint)
4. Look at browser console for errors

### Newsletter/Techniques Not Loading

**Problem:** "Unable to load..."

**Solutions:**
1. Check seed data was inserted correctly
2. Verify RLS policies allow SELECT
3. Check browser console for API errors
4. Ensure table names match exactly (case-sensitive)

### Styling Issues

**Problem:** Layout broken or missing styles

**Solutions:**
1. Check CSS file paths are correct
2. Verify all CSS files are being loaded (check Network tab)
3. Clear browser cache
4. Check for CSS syntax errors in browser console

## 📈 Analytics

### Built-in Analytics

The `page_views` table provides basic tracking:
- Page paths visited
- Referrer information
- User agent (browser info)
- Timestamps

### Query Examples

```sql
-- Most popular pages
SELECT page_path, COUNT(*) as views
FROM page_views
GROUP BY page_path
ORDER BY views DESC;

-- Daily traffic
SELECT DATE(viewed_at) as date, COUNT(*) as views
FROM page_views
GROUP BY DATE(viewed_at)
ORDER BY date DESC;

-- Referrer sources
SELECT referrer, COUNT(*) as visits
FROM page_views
WHERE referrer IS NOT NULL
GROUP BY referrer
ORDER BY visits DESC;
```

### Google Analytics (Optional)

Add to `<head>` of all HTML files:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🚦 Testing Checklist

Before deploying to production:

### Functionality
- [ ] Email signup works and saves to database
- [ ] Newsletter archive loads and displays correctly
- [ ] Technique library is searchable and filterable
- [ ] Modal windows open/close properly
- [ ] All navigation links work
- [ ] Stripe payment link opens correctly

### Content
- [ ] All newsletter issues display properly
- [ ] Technique details render correctly
- [ ] Markdown content is formatted well
- [ ] Images and assets load
- [ ] No broken links

### Design
- [ ] Responsive on mobile (320px - 480px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (1280px+)
- [ ] All buttons and forms are styled
- [ ] Hover states work on interactive elements

### Performance
- [ ] Page loads under 3 seconds
- [ ] No console errors
- [ ] No 404s for assets
- [ ] Database queries are efficient

### SEO
- [ ] Meta descriptions on all pages
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] Alt text on images
- [ ] Semantic HTML structure

## 📝 Next Steps

After MVP is live:

1. **Email Service Integration**
   - Set up Mailchimp/ConvertKit for email campaigns
   - Auto-send new newsletters to subscribers

2. **Search Engine Optimization**
   - Submit sitemap to Google Search Console
   - Optimize meta tags and descriptions
   - Create `robots.txt`

3. **Content Management**
   - Consider headless CMS for easier content updates
   - Or build simple admin panel using Supabase

4. **Advanced Analytics**
   - Set up conversion tracking
   - Monitor user behavior
   - A/B test pricing page

5. **MCP Tool Integration**
   - Build the kAIzen MCP server
   - Enable technique discovery and application

## 🆘 Support

- **Documentation:** [supabase.com/docs](https://supabase.com/docs)
- **Stripe Docs:** [stripe.com/docs](https://stripe.com/docs)
- **Issues:** Create GitHub issue in your repository

## 📄 License

This template is provided as-is for the kAIzen Systems project.

---

**Built with:**
- Supabase (PostgreSQL database + Auth + Storage)
- Vanilla JavaScript (No framework complexity)
- Modern CSS (Responsive, accessible)
- Stripe (Payment processing)

**Deployed on:**
- GitHub Pages / Netlify / Vercel (Your choice!)

*Last updated: 2025-10-28*