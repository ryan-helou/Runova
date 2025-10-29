'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { formatDistance, type DistanceUnit } from '@/lib/distance'
import { useToast } from '@/contexts/ToastContext'

interface Workout {
  id: string
  training_plan_id: string
  date: string
  workout_type: string
  planned_distance: number | null
  actual_distance: number | null
  planned_duration: number | null
  actual_duration: number | null
  completed: boolean
  effort_level: string | null
  notes: string | null
}

export default function LogWorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()
  const workoutId = params.id as string

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [formData, setFormData] = useState({
    actualDistance: '',
    actualDuration: '',
    effortLevel: '',
    notes: '',
  })

  useEffect(() => {
    loadWorkout()
  }, [workoutId])

  const loadWorkout = async () => {
    try {
      const { data } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('id', workoutId)
        .single()

      if (data) {
        setWorkout(data)
        setFormData({
          actualDistance: data.actual_distance?.toString() || '',
          actualDuration: data.actual_duration?.toString() || '',
          effortLevel: data.effort_level || '',
          notes: data.notes || '',
        })

        // Load the training plan to get distance unit
        const { data: planData } = await supabase
          .from('training_plans')
          .select('distance_unit')
          .eq('id', data.training_plan_id)
          .single()

        if (planData) {
          setDistanceUnit(planData.distance_unit || 'km')
        }
      }
    } catch (error) {
      console.error('Error loading workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('workout_logs')
        .update({
          actual_distance: formData.actualDistance ? parseFloat(formData.actualDistance) : null,
          actual_duration: formData.actualDuration ? parseInt(formData.actualDuration) : null,
          effort_level: formData.effortLevel || null,
          notes: formData.notes || null,
          completed: true,
        })
        .eq('id', workoutId)

      if (error) throw error

      showToast('success', 'Workout logged successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      showToast('error', 'Error saving workout: ' + error.message)
      setSaving(false)
    }
  }

  const handleSkip = () => {
    setShowSkipConfirm(true)
  }

  const confirmSkip = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('workout_logs')
        .update({
          completed: true,
          notes: formData.notes || 'Skipped',
        })
        .eq('id', workoutId)

      if (error) throw error

      showToast('info', 'Workout skipped')
      router.push('/dashboard')
    } catch (error: any) {
      showToast('error', 'Error skipping workout: ' + error.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Workout Not Found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const getWorkoutTypeLabel = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 text-orange-600 hover:text-orange-700 flex items-center gap-2 font-semibold"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-orange-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
            {workout.completed ? 'Workout Details' : 'Log Workout'}
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            {format(parseISO(workout.date), 'EEEE, MMMM d, yyyy')}
          </p>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {getWorkoutTypeLabel(workout.workout_type)}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {workout.planned_distance && (
                <div>
                  <div className="text-sm text-gray-600">Planned Distance</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDistance(workout.planned_distance, distanceUnit)}
                  </div>
                </div>
              )}
              {workout.planned_duration && (
                <div>
                  <div className="text-sm text-gray-600">Planned Duration</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {workout.planned_duration} minutes
                  </div>
                </div>
              )}
            </div>
          </div>

          {workout.completed ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {workout.actual_distance && (
                  <div>
                    <div className="text-sm text-gray-600">Actual Distance</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatDistance(workout.actual_distance, distanceUnit)}
                    </div>
                  </div>
                )}
                {workout.actual_duration && (
                  <div>
                    <div className="text-sm text-gray-600">Actual Duration</div>
                    <div className="text-2xl font-bold text-green-600">
                      {workout.actual_duration} minutes
                    </div>
                  </div>
                )}
              </div>
              {workout.effort_level && (
                <div>
                  <div className="text-sm text-gray-600">Effort Level</div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {workout.effort_level.replace('_', ' ')}
                  </div>
                </div>
              )}
              {workout.notes && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Notes</div>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-900">
                    {workout.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Distance ({distanceUnit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.actualDistance}
                    onChange={(e) =>
                      setFormData({ ...formData, actualDistance: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-medium placeholder:text-gray-400"
                    placeholder={workout.planned_distance?.toString() || '0'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.actualDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, actualDuration: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-medium placeholder:text-gray-400"
                    placeholder={workout.planned_duration?.toString() || '0'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did it feel?
                </label>
                <select
                  value={formData.effortLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, effortLevel: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-medium"
                >
                  <option value="">Select effort level</option>
                  <option value="easy">Easy - Could hold a conversation</option>
                  <option value="moderate">Moderate - Comfortably hard</option>
                  <option value="hard">Hard - Breathing heavily</option>
                  <option value="very_hard">Very Hard - Maximum effort</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900 font-medium"
                  placeholder="How did the workout go? Any observations?"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Complete Workout'}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={saving}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Skip
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setShowSkipConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-fade-in border-2 border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase">
              Skip Workout?
            </h3>
            <p className="text-gray-700 mb-8 font-medium">
              Are you sure you want to skip this workout? It will be marked as completed but not count towards your training.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmSkip}
                disabled={saving}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-black hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform disabled:opacity-50"
              >
                {saving ? 'Skipping...' : 'Yes, Skip'}
              </button>
              <button
                onClick={() => setShowSkipConfirm(false)}
                disabled={saving}
                className="px-6 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all hover:scale-105 transform disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
