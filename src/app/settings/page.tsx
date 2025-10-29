'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

interface Profile {
  id: string
  full_name: string | null
  email: string
  unit_preference: 'km' | 'mi'
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [unitPreference, setUnitPreference] = useState<'km' | 'mi'>('km')

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
        setFullName(data.full_name || '')
        setUnitPreference(data.unit_preference || 'km')
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
          full_name: fullName,
          unit_preference: unitPreference,
        })
        .eq('id', user?.id)

      if (error) throw error

      showToast('success', 'Settings saved successfully!')
    } catch (error: any) {
      showToast('error', 'Error saving settings: ' + error.message)
    } finally {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <header className="bg-white border-b-4 border-gradient-to-r from-orange-500 to-red-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/plans')}
                className="text-orange-600 hover:text-orange-800 font-black transition-all hover:scale-105 transform"
              >
                ← Back to Plans
              </button>
              <h1 className="text-3xl font-black text-gray-900 uppercase">Settings</h1>
            </div>
            <button
              onClick={signOut}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-bold hover:scale-105 transform"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border-2 border-gray-100">
          <h2 className="text-3xl font-black text-gray-900 mb-8 uppercase">Profile Settings</h2>

          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {profile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            )}

            <div>
              <label className="block text-base font-black text-gray-900 mb-3 uppercase">
                Distance Unit
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUnitPreference('km')}
                  className={`px-6 py-4 rounded-xl font-black text-lg transition-all duration-300 border-2 ${
                    unitPreference === 'km'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-600 shadow-lg'
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
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-600 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:shadow-md'
                  }`}
                >
                  Miles (mi)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-black text-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 transform uppercase"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
