'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { RunningGoal } from '@/types/database'

function CreatePlanContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const planId = searchParams.get('planId')
  const isEditMode = !!planId

  const [formData, setFormData] = useState({
    planName: '',
    goal: '' as RunningGoal,
    trainingFrequency: '',
    raceDate: '',
    goalTime: '',
    personalBestTime: '',
    notes: '',
    specialEvents: '',
    injuryHistory: '',
  })

  const [loading, setLoading] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [error, setError] = useState('')
  const [unitPreference, setUnitPreference] = useState<'km' | 'mi'>('km')

  // Load user's unit preference
  useEffect(() => {
    loadUnitPreference()
  }, [])

  // Load plan data if in edit mode
  useEffect(() => {
    if (isEditMode && planId) {
      loadPlan(planId)
    }
  }, [planId, isEditMode])

  const loadUnitPreference = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('unit_preference')
        .eq('id', user?.id)
        .single()

      if (data) {
        setUnitPreference(data.unit_preference || 'km')
      }
    } catch (error) {
      console.error('Error loading unit preference:', error)
    }
  }

  const loadPlan = async (id: string) => {
    setLoadingPlan(true)
    try {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          planName: data.plan_name || '',
          goal: data.goal || '',
          trainingFrequency: data.training_frequency?.toString() || '',
          raceDate: data.race_date || '',
          goalTime: data.goal_time || '',
          personalBestTime: data.personal_best_time || '',
          notes: data.notes || '',
          specialEvents: data.special_events || '',
          injuryHistory: data.injury_history || '',
        })
      }
    } catch (err: any) {
      setError('Failed to load plan data')
      console.error('Error loading plan:', err)
    } finally {
      setLoadingPlan(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    try {
      if (isEditMode && planId) {
        // Update existing plan
        const response = await fetch('/api/update-plan', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: planId,
            planName: formData.planName,
            goal: formData.goal,
            trainingFrequency: parseInt(formData.trainingFrequency),
            raceDate: formData.raceDate || null,
            goalTime: formData.goalTime || null,
            personalBestTime: formData.personalBestTime || null,
            notes: formData.notes || null,
            specialEvents: formData.specialEvents || null,
            injuryHistory: formData.injuryHistory || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update plan')
        }

        // Redirect to the updated plan
        router.push(`/dashboard?planId=${planId}`)
      } else {
        // Create new plan
        const response = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planName: formData.planName,
            goal: formData.goal,
            trainingFrequency: parseInt(formData.trainingFrequency),
            raceDate: formData.raceDate || null,
            goalTime: formData.goalTime || null,
            personalBestTime: formData.personalBestTime || null,
            notes: formData.notes || null,
            specialEvents: formData.specialEvents || null,
            injuryHistory: formData.injuryHistory || null,
            distanceUnit: unitPreference,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate plan')
        }

        // Redirect to the new plan
        router.push(`/dashboard?planId=${data.plan.id}`)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/plans')}
          className="mb-8 text-orange-600 hover:text-orange-800 font-black inline-flex items-center gap-2 transition-all hover:scale-105 transform text-lg"
        >
          ← Back to Plans
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-10 border-2 border-gray-100">
          <div className="mb-10">
            <h1 className="text-5xl font-black text-gray-900 mb-4 uppercase">
              {isEditMode ? 'Edit Training Plan' : 'Create Training Plan'}
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              {isEditMode
                ? 'Update your training plan details'
                : 'Tell us about your goals and we\'ll create a personalized training plan for you'
              }
            </p>
            {!isEditMode && (
              <div className="mt-4 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-800">
                  Your plan will use <span className="font-black text-orange-600 uppercase">{unitPreference === 'km' ? 'Kilometers' : 'Miles'}</span> for distances.
                  <button
                    onClick={() => router.push('/settings')}
                    className="ml-2 text-orange-600 hover:text-orange-800 underline font-black"
                  >
                    Change in settings
                  </button>
                </p>
              </div>
            )}
          </div>

          {loadingPlan && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          )}

          {!loadingPlan && (

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-base font-black text-gray-900 mb-3 uppercase">
                Plan Name <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                required
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium text-lg hover:border-gray-300"
                placeholder="e.g., Spring Marathon 2025"
              />
            </div>

            <div>
              <label className="block text-base font-black text-gray-900 mb-3 uppercase">
                Goal Distance <span className="text-orange-600">*</span>
              </label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as RunningGoal })}
                required
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-gray-900 font-bold text-lg hover:border-gray-300"
              >
                <option value="">Select your goal distance</option>
                <option value="5k">5K</option>
                <option value="10k">10K</option>
                <option value="half_marathon">Half Marathon</option>
                <option value="marathon">Marathon</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-black text-gray-900 mb-3 uppercase">
                Training Frequency (days per week) <span className="text-orange-600">*</span>
              </label>
              <select
                value={formData.trainingFrequency}
                onChange={(e) => setFormData({ ...formData, trainingFrequency: e.target.value })}
                required
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-gray-900 font-bold text-lg hover:border-gray-300"
              >
                <option value="">Select training days per week</option>
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
                <option value="7">7 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Race Date (optional)
              </label>
              <input
                type="date"
                value={formData.raceDate}
                onChange={(e) => setFormData({ ...formData, raceDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Goal Time (optional)
                </label>
                <input
                  type="text"
                  value={formData.goalTime}
                  onChange={(e) => setFormData({ ...formData, goalTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., 4:00:00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Personal Best Time (optional)
                </label>
                <input
                  type="text"
                  value={formData.personalBestTime}
                  onChange={(e) => setFormData({ ...formData, personalBestTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., 4:30:00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                placeholder="Any additional notes or preferences..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Special Events (optional)
              </label>
              <textarea
                value={formData.specialEvents}
                onChange={(e) => setFormData({ ...formData, specialEvents: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                placeholder="Upcoming races, vacations, or other life events..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Injury History or Limitations (optional)
              </label>
              <textarea
                value={formData.injuryHistory}
                onChange={(e) => setFormData({ ...formData, injuryHistory: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                placeholder="Any past injuries or physical limitations we should know about..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-5 rounded-xl font-black text-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 transform uppercase"
            >
              {loading
                ? isEditMode ? 'Updating Plan...' : 'Generating Your Plan...'
                : isEditMode ? 'Update Training Plan' : 'Generate Training Plan'
              }
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CreatePlanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    }>
      <CreatePlanContent />
    </Suspense>
  )
}
