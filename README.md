# Ryan Widgeon - Free Tech for Small Businesses

A Next.js 14 website with Tailwind CSS for offering free tech services to Atlanta small businesses.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Clerk (for admin)
- **Email**: Resend
- **Analytics**: Microsoft Clarity
- **Hosting**: Vercel

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` with required variables (see `ENV_SETUP.md`)

3. Run development server:
```bash
npm run dev
```

## Environment Variables

See `ENV_SETUP.md` for required environment variables.

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Features

- Landing page with hero, capabilities, how it works sections
- Prompt library with copy functionality
- Contact form and AI class signup form
- Admin dashboard for managing submissions and prompts
- Clerk authentication for admin access
