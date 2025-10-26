'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GeneratePlanPage() {
  const [status, setStatus] = useState('Analyzing your profile...')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    generatePlan()
  }, [])

  const generatePlan = async () => {
    try {
      setStatus('Creating your personalized training plan...')

      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      setStatus('Plan created successfully! Redirecting...')

      // Redirect to dashboard after a brief moment
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-orange-100">
        {!error ? (
          <>
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
              Generating Your Plan
            </h2>
            <p className="text-gray-600 text-lg mb-6">{status}</p>
            <div className="bg-orange-50 border-2 border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-sm font-medium">
              This may take up to 30 seconds. Please don't close this page.
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Generating Plan
            </h2>
            <p className="text-red-600 mb-6 font-medium">{error}</p>
            <button
              onClick={generatePlan}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
