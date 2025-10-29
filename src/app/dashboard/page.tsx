'use client'

import { useEffect, useState, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDistance, type DistanceUnit } from '@/lib/distance'

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

function DashboardContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()))
  const [loading, setLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [unitPreference, setUnitPreference] = useState<DistanceUnit>('km')

  useEffect(() => {
    loadDashboardData()
  }, [searchParams])

  const loadDashboardData = async () => {
    try {
      const planId = searchParams.get('planId')

      let plan = null
      if (planId) {
        // Get specific plan by ID
        const { data } = await supabase
          .from('training_plans')
          .select('*')
          .eq('id', planId)
          .eq('user_id', user?.id)
          .single()
        plan = data
      } else {
        // Get active training plan
        const { data } = await supabase
          .from('training_plans')
          .select('*')
          .eq('user_id', user?.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        plan = data
      }

      if (plan) {
        setTrainingPlan(plan)
        // Use the plan's distance unit (plans are immutable in their unit)
        setUnitPreference(plan.distance_unit || 'km')

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
      easy_run: 'bg-green-100 text-green-800 border-green-400',
      long_run: 'bg-emerald-100 text-emerald-800 border-emerald-400',
      tempo: 'bg-orange-100 text-orange-800 border-orange-400',
      intervals: 'bg-red-100 text-red-800 border-red-400',
      recovery: 'bg-lime-100 text-lime-800 border-lime-400',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!trainingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-6 uppercase">No Training Plan Found</h2>
          <button
            onClick={() => router.push('/plans')}
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-black hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
          >
            Back to Plans
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b-4 border-gradient-to-r from-orange-500 to-red-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/plans')}
                className="text-orange-600 hover:text-orange-800 font-black mb-2 flex items-center gap-1 transition-all hover:scale-105 transform"
              >
                ← Back to Plans
              </button>
              <h1 className="text-3xl font-black text-gray-900">{trainingPlan.plan_name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={signOut}
                className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-bold hover:scale-105 transform"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-200">
          <h2 className="text-2xl font-black text-gray-900 mb-6">TRAINING PROGRESS</h2>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex justify-between text-base font-black text-gray-700 mb-3">
                <span>Progress</span>
                <span>{completedCount} / {totalCount} workouts</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 h-6 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-gray-900">THIS WEEK</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                className="px-5 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-bold hover:scale-105 transform shadow-md"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentWeekStart(startOfWeek(new Date()))}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-black shadow-lg hover:shadow-2xl hover:scale-105 transform"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                className="px-5 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-bold hover:scale-105 transform shadow-md"
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
                  className={`border-2 rounded-xl p-4 min-h-[140px] transition-all duration-300 ${
                    isToday ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="font-black text-sm text-gray-700 mb-1 uppercase">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-2xl font-black text-gray-900 mb-3">
                    {format(day, 'd')}
                  </div>
                  {dayWorkouts.map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => setSelectedWorkout(workout)}
                      className={`w-full text-left text-xs p-2.5 rounded-lg border-2 mb-2 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-bold ${getWorkoutTypeColor(
                        workout.workout_type
                      )} ${workout.completed ? 'opacity-70 ring-2 ring-green-500' : ''}`}
                    >
                      <div className="font-black uppercase text-xs">{getWorkoutTypeLabel(workout.workout_type)}</div>
                      {workout.planned_distance && (
                        <div className="font-bold">{formatDistance(workout.planned_distance, unitPreference)}</div>
                      )}
                      {workout.completed && <div className="text-xs font-black text-green-700">✓ DONE</div>}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Recommendations */}
        {trainingPlan.ai_recommendations && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase">Coach's Recommendations</h2>
            <p className="text-gray-800 whitespace-pre-line leading-relaxed font-medium text-lg">{trainingPlan.ai_recommendations}</p>
          </div>
        )}
      </main>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setSelectedWorkout(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-fade-in border-2 border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-black text-gray-900 mb-6 uppercase">
              {getWorkoutTypeLabel(selectedWorkout.workout_type)}
            </h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-bold">Date:</span>
                <span className="font-black text-gray-900">{format(parseISO(selectedWorkout.date), 'MMMM d, yyyy')}</span>
              </div>
              {selectedWorkout.planned_distance && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font-bold">Distance:</span>
                  <span className="font-black text-gray-900">{formatDistance(selectedWorkout.planned_distance, unitPreference)}</span>
                </div>
              )}
              {selectedWorkout.planned_duration && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 font-bold">Duration:</span>
                  <span className="font-black text-gray-900">{selectedWorkout.planned_duration} minutes</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  router.push(`/log-workout/${selectedWorkout.id}`)
                }}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-black hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
              >
                {selectedWorkout.completed ? 'View Details' : 'Log Workout'}
              </button>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="px-6 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all hover:scale-105 transform"
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

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
