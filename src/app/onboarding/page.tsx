'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [unitPreference, setUnitPreference] = useState<'km' | 'mi'>('km')
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
      // Create simple profile with unit preference
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        unit_preference: unitPreference,
      })

      if (profileError) throw profileError

      // Redirect to plans page
      router.push('/plans')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-12 border-2 border-gray-100">
        <div className="mb-10">
          <h1 className="text-5xl font-black bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 bg-clip-text text-transparent mb-4 uppercase text-center">
            Welcome to Runova!
          </h1>
          <p className="text-xl text-gray-700 font-medium text-center">
            Let's get started. What's your name?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-base font-black text-gray-900 mb-3 uppercase">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium text-lg hover:border-gray-300"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-base font-black text-gray-900 mb-3 uppercase">
              Distance Unit Preference
            </label>
            <p className="text-sm text-gray-600 mb-4 font-medium">
              This will be used for all your training plans and workouts
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUnitPreference('km')}
                className={`px-6 py-4 rounded-xl font-black text-lg transition-all duration-300 border-2 ${
                  unitPreference === 'km'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-600 shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:shadow-md'
                }`}
              >
                Kilometers (km)
              </button>
              <button
                type="button"
                onClick={() => setUnitPreference('mi')}
                className={`px-6 py-4 rounded-xl font-black text-lg transition-all duration-300 border-2 ${
                  unitPreference === 'mi'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-600 shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:shadow-md'
                }`}
              >
                Miles (mi)
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-5 rounded-xl font-black text-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 transform uppercase"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
