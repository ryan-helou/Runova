import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
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
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Verify the plan belongs to the user before deleting
    const { data: plan, error: fetchError } = await supabase
      .from('training_plans')
      .select('id')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !plan) {
      return NextResponse.json({ error: 'Plan not found or unauthorized' }, { status: 404 })
    }

    // Delete the plan (workout logs will be preserved)
    const { error: deleteError } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting plan:', deleteError)
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in delete-plan route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
