# Runova Setup Instructions

## Prerequisites
- OpenAI API key (you mentioned you have this)
- Supabase account

## Setup Steps

### 1. Supabase Setup
1. Go to https://supabase.com and create a new project
2. Once your project is created, go to Project Settings > API
3. Copy your project URL and anon/public key

### 2. Configure Environment Variables
1. Open `.env.local` in the project root
2. Fill in your actual values (the file currently has empty values):
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (e.g., https://abcdefg.supabase.co)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key (long JWT token starting with eyJ...)
   - `OPENAI_API_KEY` - Your OpenAI API key (starting with sk-proj-...)

**Important**: The app will not build or run without these values configured!

### 3. Create Database Tables
1. In your Supabase project, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste and run it in the SQL Editor
4. This will create all necessary tables, policies, and functions

### 4. Enable Email Authentication in Supabase
1. Go to Authentication > Providers in your Supabase dashboard
2. Make sure Email provider is enabled
3. Configure your email templates if desired

### 5. Run the Development Server
```bash
npm run dev
```

Your app should now be running at http://localhost:3000

## Features Included
- User authentication (signup/login)
- AI-powered training plan generation
- Calendar view of workouts
- Progress tracking
- Plan adjustments based on progress
