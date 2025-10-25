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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {!error ? (
          <>
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Generating Your Plan
            </h2>
            <p className="text-gray-600 mb-6">{status}</p>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              This may take up to 30 seconds. Please don't close this page.
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Generating Plan
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={generatePlan}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
