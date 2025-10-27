'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { RunningGoal } from '@/types/database'

export default function CreatePlanPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

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
  const [error, setError] = useState('')

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
      // Call the API to generate the plan
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      // Redirect to the new plan
      router.push(`/dashboard?planId=${data.plan.id}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/plans')}
          className="mb-4 text-orange-600 hover:text-orange-700 flex items-center gap-2 font-semibold"
        >
          ← Back to Plans
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-orange-100">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
              Create Training Plan
            </h1>
            <p className="text-gray-600 text-lg">
              Tell us about your goals and we'll create a personalized training plan for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Plan Name <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                placeholder="e.g., Spring Marathon 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Goal Distance <span className="text-orange-600">*</span>
              </label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as RunningGoal })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Training Frequency (days per week) <span className="text-orange-600">*</span>
              </label>
              <select
                value={formData.trainingFrequency}
                onChange={(e) => setFormData({ ...formData, trainingFrequency: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                placeholder="Any past injuries or physical limitations we should know about..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? 'Generating Your Plan...' : 'Generate Training Plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
