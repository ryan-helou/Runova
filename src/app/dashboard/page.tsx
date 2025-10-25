'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'

interface Workout {
  id: string
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

interface TrainingPlan {
  id: string
  plan_name: string
  start_date: string
  end_date: string
  goal: string
  weekly_schedule: any
  ai_recommendations: string
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()))
  const [loading, setLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get active training plan
      const { data: plan } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (plan) {
        setTrainingPlan(plan)

        // Get workouts
        const { data: workoutData } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('training_plan_id', plan.id)
          .order('date', { ascending: true })

        if (workoutData) {
          setWorkouts(workoutData)
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWorkoutsForDate = (date: Date) => {
    return workouts.filter((w) => isSameDay(parseISO(w.date), date))
  }

  const getWorkoutTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      easy_run: 'bg-green-100 text-green-800 border-green-300',
      long_run: 'bg-blue-100 text-blue-800 border-blue-300',
      tempo: 'bg-orange-100 text-orange-800 border-orange-300',
      intervals: 'bg-red-100 text-red-800 border-red-300',
      recovery: 'bg-purple-100 text-purple-800 border-purple-300',
      rest: 'bg-gray-100 text-gray-800 border-gray-300',
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getWorkoutTypeLabel = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!trainingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Training Plan</h2>
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Create a Plan
          </button>
        </div>
      </div>
    )
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  const completedCount = workouts.filter(w => w.completed).length
  const totalCount = workouts.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Runova Dashboard</h1>
              <p className="text-sm text-gray-600">{trainingPlan.plan_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/settings')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Settings
              </button>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Progress</h2>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{completedCount} / {totalCount} workouts</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">This Week</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentWeekStart(startOfWeek(new Date()))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayWorkouts = getWorkoutsForDate(day)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={day.toISOString()}
                  className={`border rounded-lg p-3 min-h-[120px] ${
                    isToday ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-700 mb-2">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    {format(day, 'd')}
                  </div>
                  {dayWorkouts.map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => setSelectedWorkout(workout)}
                      className={`w-full text-left text-xs p-2 rounded border mb-1 hover:opacity-80 transition ${getWorkoutTypeColor(
                        workout.workout_type
                      )} ${workout.completed ? 'opacity-60' : ''}`}
                    >
                      <div className="font-semibold">{getWorkoutTypeLabel(workout.workout_type)}</div>
                      {workout.planned_distance && (
                        <div>{workout.planned_distance} mi</div>
                      )}
                      {workout.completed && <div className="text-xs">✓ Done</div>}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Recommendations */}
        {trainingPlan.ai_recommendations && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Coach's Recommendations</h2>
            <p className="text-gray-700 whitespace-pre-line">{trainingPlan.ai_recommendations}</p>
          </div>
        )}
      </main>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedWorkout(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {getWorkoutTypeLabel(selectedWorkout.workout_type)}
            </h3>
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-gray-600">Date:</span>{' '}
                <span className="font-semibold">{format(parseISO(selectedWorkout.date), 'MMMM d, yyyy')}</span>
              </div>
              {selectedWorkout.planned_distance && (
                <div>
                  <span className="text-gray-600">Distance:</span>{' '}
                  <span className="font-semibold">{selectedWorkout.planned_distance} miles</span>
                </div>
              )}
              {selectedWorkout.planned_duration && (
                <div>
                  <span className="text-gray-600">Duration:</span>{' '}
                  <span className="font-semibold">{selectedWorkout.planned_duration} minutes</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  router.push(`/log-workout/${selectedWorkout.id}`)
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {selectedWorkout.completed ? 'View Details' : 'Log Workout'}
              </button>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
