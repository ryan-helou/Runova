'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ExperienceLevel, RunningGoal } from '@/types/database'

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    fullName: '',
    experienceLevel: '' as ExperienceLevel,
    runningGoal: '' as RunningGoal,
    currentWeeklyMileage: '',
    trainingFrequency: '',
    targetRaceDate: '',
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
      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email!,
        full_name: formData.fullName,
        experience_level: formData.experienceLevel,
        running_goal: formData.runningGoal,
        current_weekly_mileage: parseFloat(formData.currentWeeklyMileage),
        training_frequency: parseInt(formData.trainingFrequency),
        target_race_date: formData.targetRaceDate || null,
        injury_history: formData.injuryHistory || null,
      })

      if (profileError) throw profileError

      // Redirect to plan generation
      router.push('/generate-plan')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Runova!
          </h1>
          <p className="text-gray-600">
            Let's create your personalized training plan. Tell us about yourself and your running goals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateFormData('fullName', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => updateFormData('experienceLevel', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select your experience level</option>
              <option value="beginner">Beginner - New to running or returning after a break</option>
              <option value="intermediate">Intermediate - Regular runner with some race experience</option>
              <option value="advanced">Advanced - Experienced runner with multiple races</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Running Goal
            </label>
            <select
              value={formData.runningGoal}
              onChange={(e) => updateFormData('runningGoal', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select your goal</option>
              <option value="5k">5K Race</option>
              <option value="10k">10K Race</option>
              <option value="half_marathon">Half Marathon</option>
              <option value="marathon">Marathon</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Weekly Mileage (miles)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.currentWeeklyMileage}
              onChange={(e) => updateFormData('currentWeeklyMileage', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Frequency (days per week)
            </label>
            <select
              value={formData.trainingFrequency}
              onChange={(e) => updateFormData('trainingFrequency', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select days per week</option>
              <option value="3">3 days</option>
              <option value="4">4 days</option>
              <option value="5">5 days</option>
              <option value="6">6 days</option>
              <option value="7">7 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Race Date (optional)
            </label>
            <input
              type="date"
              value={formData.targetRaceDate}
              onChange={(e) => updateFormData('targetRaceDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Injury History or Limitations (optional)
            </label>
            <textarea
              value={formData.injuryHistory}
              onChange={(e) => updateFormData('injuryHistory', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Any past injuries or physical limitations we should know about?"
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
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Create My Training Plan'}
          </button>
        </form>
      </div>
    </div>
  )
}
