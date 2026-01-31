# Environment Variables Setup

Create a `.env.local` file in this directory with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://polmkodgdcqzwftbtzmu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=https://polmkodgdcqzwftbtzmu.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGl2aW5nLWNob3ctODYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_4epVYEEiiLUDi6UwsNomAYLS443NYOEzSE5hcVyjk7

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=onboarding@resend.dev

# Calendly
CALENDLY_LINK=https://calendly.com/ryansmallbussinessdoctor/15min
```

## Vercel Deployment

Add these same variables in Vercel Dashboard → Settings → Environment Variables.
