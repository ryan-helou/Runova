import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      planId,
      planName,
      goal,
      trainingFrequency,
      raceDate,
      goalTime,
      personalBestTime,
      notes,
      specialEvents,
      injuryHistory,
    } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Verify the plan belongs to the user
    const { data: existingPlan, error: fetchError } = await supabase
      .from('training_plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: 'Plan not found or unauthorized' }, { status: 404 })
    }

    // Update only the editable fields (do NOT regenerate AI plan)
    const { data: updatedPlan, error: updateError } = await supabase
      .from('training_plans')
      .update({
        plan_name: planName,
        goal: goal,
        training_frequency: trainingFrequency,
        race_date: raceDate,
        goal_time: goalTime,
        personal_best_time: personalBestTime,
        notes: notes,
        special_events: specialEvents,
        injury_history: injuryHistory,
      })
      .eq('id', planId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating plan:', updateError)
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan: updatedPlan }, { status: 200 })
  } catch (error) {
    console.error('Error in update-plan route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
