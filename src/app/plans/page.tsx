'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'

interface TrainingPlan {
  id: string
  created_at: string
  plan_name: string
  goal: string
  race_date: string | null
  start_date: string
  end_date: string
  is_active: boolean
}

export default function PlansPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const { data } = await supabase
        .from('training_plans')
        .select('id, created_at, plan_name, goal, race_date, start_date, end_date, is_active')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (data) {
        setPlans(data)
      }
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGoalLabel = (goal: string) => {
    const goalMap: Record<string, string> = {
      '5k': '5K',
      '10k': '10K',
      'half_marathon': 'Half Marathon',
      'marathon': 'Marathon',
      'custom': 'Custom',
    }
    return goalMap[goal] || goal
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            My Training Plans
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/settings')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold"
            >
              Settings
            </button>
            <button
              onClick={() => router.push('/create-plan')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
            >
              Create New Plan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-orange-100">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              You don't have a running plan yet
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Create your first training plan to get started on your running journey!
            </p>
            <button
              onClick={() => router.push('/create-plan')}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => router.push(`/dashboard?planId=${plan.id}`)}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-100 hover:border-orange-300 transition-all cursor-pointer hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex-1 pr-2">
                    {plan.plan_name}
                  </h3>
                  {plan.is_active && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">
                      {getGoalLabel(plan.goal)}
                    </span>
                  </div>

                  {plan.race_date && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Race: {format(parseISO(plan.race_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-600 text-sm">
                      {format(parseISO(plan.start_date), 'MMM d')} - {format(parseISO(plan.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Created {format(parseISO(plan.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
