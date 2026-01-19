# Deployment Checklist

## ✅ Step 1: Run SQL in Supabase
1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/polmkodgdcqzwftbtzmu/sql/new)
2. Copy and paste the contents from `supabase_setup.sql`
3. Click **RUN**

## ✅ Step 2: Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import repository: `wacemindu123/itsryan`
3. Add these environment variables:

```
SUPABASE_URL=https://polmkodgdcqzwftbtzmu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbG1rb2RnZGNxendmdGJ0em11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODcxMTksImV4cCI6MjA4NDM2MzExOX0.GCvyxpq69sI_YOYbHq9TGV4z7Yh-h8xLamec5-gjy48
EMAIL_USER=[YOUR_GMAIL]
EMAIL_PASS=[YOUR_APP_PASSWORD]
CALENDLY_LINK=https://calendly.com/ryansmallbussinessdoctor/15min
```

4. Click **Deploy**

## ✅ Step 3: Configure Domain (After Deployment)
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

## Gmail App Password Setup
If you haven't set up Gmail app password yet:
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Generate a new app password
3. Use this password for EMAIL_PASS

## Testing After Deployment
- Main site: `your-domain.com`
- Admin panel: `your-domain.com/admin`
- Test form submission
- Test Calendly email sending from admin
