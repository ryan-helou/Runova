# Runova - AI-Powered Running Coach

Runova is a web application that generates personalized running training plans using AI. Track your progress, log workouts, and achieve your running goals with intelligent coaching.

## Features

- **AI-Generated Training Plans**: Get customized training plans based on your experience, goals, and schedule
- **User Authentication**: Secure login and signup with Supabase Auth
- **Calendar View**: Visualize your weekly training schedule
- **Progress Tracking**: Log completed workouts with distance, duration, and effort level
- **Plan Adjustments**: Regenerate plans based on updated goals or progress
- **Personalized Recommendations**: AI-powered coaching tips specific to your profile

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4
- **Date Management**: date-fns

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Supabase account

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API and copy:
   - Project URL
   - Anon/public key
3. In the SQL Editor, run the schema from `supabase-schema.sql`
4. Enable Email auth in Authentication > Providers

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up**: Create a new account
2. **Onboarding**: Complete your runner profile
3. **Generate Plan**: AI creates a personalized training plan
4. **Dashboard**: View your weekly schedule
5. **Log Workouts**: Track completed runs
6. **Adjust**: Regenerate plans as your fitness improves

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-plan/     # AI plan generation endpoint
│   ├── dashboard/              # Main dashboard
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   ├── onboarding/             # User profile setup
│   ├── generate-plan/          # Plan generation loading page
│   ├── log-workout/            # Workout logging
│   └── settings/               # User settings & plan regeneration
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
├── lib/
│   └── supabase/               # Supabase client configuration
└── types/
    └── database.ts             # TypeScript types for database

```

## Database Schema

### Tables

- **profiles**: User information and running goals
- **training_plans**: AI-generated training schedules
- **workout_logs**: Completed workout records

See `supabase-schema.sql` for the complete schema.

## API Routes

### POST /api/generate-plan

Generates a personalized training plan using OpenAI GPT-4.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "plan": {
    "id": "uuid",
    "plan_name": "string",
    "weekly_schedule": [...],
    "ai_recommendations": "string"
  }
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

This app can be deployed to Vercel, Netlify, or any platform that supports Next.js.

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy

## Future Enhancements

- [ ] Integration with Strava/Garmin
- [ ] Mobile app
- [ ] Social features (share workouts, challenges)
- [ ] Advanced analytics and insights
- [ ] Nutrition guidance
- [ ] Injury prevention tips
- [ ] Race day strategy

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
