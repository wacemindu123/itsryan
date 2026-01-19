# Free Tech Services for Small Businesses

A web application that helps small businesses scale using AI and technology solutions.

## Features

- **Landing Page**: Modern, responsive website showcasing services
- **Lead Collection**: Form to capture businesses' scaling challenges
- **Admin Dashboard**: View and manage form submissions
- **Email Integration**: Send Calendly invitations to prospects
- **Calendly Widget**: Direct scheduling option for visitors

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/free-tech-services.git
cd free-tech-services
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CALENDLY_LINK=https://calendly.com/your-link
```

4. Start the server
```bash
npm start
```

5. Access the application
- Main site: http://localhost:3001
- Admin panel: http://localhost:3001/admin

## Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an app password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the app password in your `.env` file

## Deployment Guide

### Prerequisites
- Vercel account
- Supabase account
- Custom domain (optional)

### Step 1: Set up Supabase Database

1. Go to [Supabase](https://app.supabase.com) and create a new project
2. Once created, go to the SQL Editor
3. Run the SQL from `supabase_setup.sql` to create the submissions table
4. Go to Settings → API and copy:
   - Project URL (SUPABASE_URL)
   - Anon public key (SUPABASE_ANON_KEY)

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and click "Add New Project"
2. Import your GitHub repository: `https://github.com/wacemindu123/itsryan`
3. Configure environment variables:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CALENDLY_LINK=https://calendly.com/ryansmallbussinessdoctor/15min
   ```
4. Click "Deploy"

### Step 3: Configure Custom Domain

1. In Vercel dashboard, go to your project settings
2. Click on "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to update your DNS settings

### Local Development vs Production

- Local: Uses SQLite database and runs on port 3001
- Production: Uses Supabase and Vercel serverless functions

## License

This project is open source and available under the MIT License.
