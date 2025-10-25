'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ExperienceLevel, RunningGoal } from '@/types/database'

interface Profile {
  id: string
  full_name: string | null
  experience_level: ExperienceLevel
  running_goal: RunningGoal
  current_weekly_mileage: number
  training_frequency: number
  target_race_date: string | null
  injury_history: string | null
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    experienceLevel: '' as ExperienceLevel,
    runningGoal: '' as RunningGoal,
    currentWeeklyMileage: '',
    trainingFrequency: '',
    targetRaceDate: '',
    injuryHistory: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (data) {
        setProfile(data)
        setFormData({
          fullName: data.full_name || '',
          experienceLevel: data.experience_level,
          runningGoal: data.running_goal,
          currentWeeklyMileage: data.current_weekly_mileage.toString(),
          trainingFrequency: data.training_frequency.toString(),
          targetRaceDate: data.target_race_date || '',
          injuryHistory: data.injury_history || '',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          experience_level: formData.experienceLevel,
          running_goal: formData.runningGoal,
          current_weekly_mileage: parseFloat(formData.currentWeeklyMileage),
          training_frequency: parseInt(formData.trainingFrequency),
          target_race_date: formData.targetRaceDate || null,
          injury_history: formData.injuryHistory || null,
        })
        .eq('id', user?.id)

      if (error) throw error

      alert('Settings saved successfully!')
    } catch (error: any) {
      alert('Error saving settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRegeneratePlan = async () => {
    if (
      !confirm(
        'This will create a new training plan and deactivate your current plan. Are you sure?'
      )
    ) {
      return
    }

    setRegenerating(true)

    try {
      // Deactivate current plans
      await supabase
        .from('training_plans')
        .update({ is_active: false })
        .eq('user_id', user?.id)

      // Redirect to plan generation
      router.push('/generate-plan')
    } catch (error: any) {
      alert('Error regenerating plan: ' + error.message)
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experienceLevel: e.target.value as ExperienceLevel,
                  })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Running Goal
              </label>
              <select
                value={formData.runningGoal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    runningGoal: e.target.value as RunningGoal,
                  })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentWeeklyMileage: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Frequency (days per week)
              </label>
              <select
                value={formData.trainingFrequency}
                onChange={(e) =>
                  setFormData({ ...formData, trainingFrequency: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
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
                onChange={(e) =>
                  setFormData({ ...formData, targetRaceDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Injury History or Limitations (optional)
              </label>
              <textarea
                value={formData.injuryHistory}
                onChange={(e) =>
                  setFormData({ ...formData, injuryHistory: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Training Plan
          </h2>
          <p className="text-gray-600 mb-6">
            Generate a new training plan based on your updated profile and progress.
          </p>
          <button
            onClick={handleRegeneratePlan}
            disabled={regenerating}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
          >
            {regenerating ? 'Regenerating...' : 'Regenerate Training Plan'}
          </button>
        </div>
      </main>
    </div>
  )
}
