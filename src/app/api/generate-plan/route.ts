import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { addWeeks, format, addDays, startOfWeek } from 'date-fns'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Determine plan duration based on goal
    const planDurations: Record<string, number> = {
      '5k': 8,
      '10k': 10,
      'half_marathon': 12,
      'marathon': 16,
      'general_fitness': 12,
    }

    const weeks = planDurations[profile.running_goal] || 12

    // Calculate dates
    const startDate = profile.target_race_date
      ? addWeeks(new Date(profile.target_race_date), -weeks)
      : new Date()
    const endDate = addWeeks(startDate, weeks)

    // Create AI prompt
    const prompt = `You are an expert running coach. Create a detailed ${weeks}-week training plan with the following specifications:

Runner Profile:
- Experience Level: ${profile.experience_level}
- Goal: ${profile.running_goal.replace('_', ' ')}
- Current Weekly Mileage: ${profile.current_weekly_mileage} miles
- Training Days Per Week: ${profile.training_frequency}
- Target Race Date: ${profile.target_race_date || 'Not specified'}
- Injury History: ${profile.injury_history || 'None'}

Requirements:
1. Create a progressive training plan that builds safely from their current mileage
2. Include variety: easy runs, long runs, tempo runs, intervals, and recovery/rest days
3. Follow the 10% rule for weekly mileage increases
4. Include a taper period if preparing for a race
5. Provide specific guidance for each workout type

Return a JSON response with this exact structure:
{
  "planName": "string - creative name for the plan",
  "weeklySchedule": [
    {
      "week": 1,
      "totalMileage": number,
      "workouts": [
        {
          "day": 1,
          "type": "easy_run" | "long_run" | "tempo" | "intervals" | "recovery" | "rest",
          "distance": number (in miles, can be decimal),
          "duration": number (estimated minutes),
          "description": "string - detailed workout instructions",
          "intensity": "easy" | "moderate" | "hard"
        }
      ]
    }
  ],
  "recommendations": "string - overall training advice and tips specific to this runner"
}

Important: Return ONLY valid JSON, no markdown formatting or extra text.`

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert running coach who creates detailed, personalized training plans. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const planData = JSON.parse(completion.choices[0].message.content || '{}')

    // Save plan to database
    const { data: trainingPlan, error: planError } = await supabase
      .from('training_plans')
      .insert({
        user_id: user.id,
        plan_name: planData.planName,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        goal: profile.running_goal,
        weekly_schedule: planData.weeklySchedule,
        ai_recommendations: planData.recommendations,
        is_active: true,
      })
      .select()
      .single()

    if (planError) {
      console.error('Error saving plan:', planError)
      throw planError
    }

    // Create workout logs for all scheduled workouts
    const workoutLogs = []
    let currentDate = startOfWeek(startDate)

    for (const week of planData.weeklySchedule) {
      for (const workout of week.workouts) {
        const workoutDate = addDays(currentDate, workout.day - 1)
        workoutLogs.push({
          user_id: user.id,
          training_plan_id: trainingPlan.id,
          date: format(workoutDate, 'yyyy-MM-dd'),
          workout_type: workout.type,
          planned_distance: workout.distance,
          planned_duration: workout.duration,
          completed: false,
        })
      }
      currentDate = addWeeks(currentDate, 1)
    }

    if (workoutLogs.length > 0) {
      await supabase.from('workout_logs').insert(workoutLogs)
    }

    return NextResponse.json({
      success: true,
      plan: trainingPlan,
    })
  } catch (error: any) {
    console.error('Error generating plan:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate plan' },
      { status: 500 }
    )
  }
}
