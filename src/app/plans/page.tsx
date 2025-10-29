'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Plus, Settings, TrendingUp, Calendar, Clock, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

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
  const { showToast } = useToast()

  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<TrainingPlan | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null)
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

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

  const handleDeleteClick = (plan: TrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setPlanToDelete(plan)
    setDeleteModalOpen(true)
    setOpenDropdown(null)
  }

  const handleEditClick = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    router.push(`/create-plan?planId=${planId}`)
  }

  const confirmDelete = async () => {
    if (!planToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/delete-plan`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: planToDelete.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete plan')
      }

      // Remove plan from state
      setPlans(plans.filter(p => p.id !== planToDelete.id))
      setDeleteModalOpen(false)
      setPlanToDelete(null)
      showToast('success', 'Training plan deleted successfully')
    } catch (error) {
      console.error('Error deleting plan:', error)
      showToast('error', 'Failed to delete plan. Please try again.')
    } finally {
      setDeleting(false)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <h1 className="text-4xl font-black text-gray-900">
            My Training Plans
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/settings')}
              className="p-3 text-gray-600 hover:text-orange-600 transition-all duration-300 hover:scale-110 transform"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button
              onClick={() => router.push('/create-plan')}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-black hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Plan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {plans.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl p-16 text-center border-2 border-orange-200">
            <div className="mb-8">
              <FileText className="mx-auto h-20 w-20 text-orange-400" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              NO TRAINING PLANS YET
            </h2>
            <p className="text-xl text-gray-700 mb-10 font-medium">
              Create your first training plan to get started on your running journey
            </p>
            <button
              onClick={() => router.push('/create-plan')}
              className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-black text-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform inline-flex items-center gap-2"
            >
              <Plus className="w-6 h-6" />
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="group bg-white rounded-2xl shadow-lg p-7 border-2 border-gray-100 hover:border-orange-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform relative"
              >
                <div className="flex items-start justify-between mb-5">
                  <h3
                    onClick={() => router.push(`/dashboard?planId=${plan.id}`)}
                    className="text-2xl font-black text-gray-900 flex-1 pr-2 group-hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    {plan.plan_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {plan.is_active && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-black rounded-lg shadow-md">
                        ACTIVE
                      </span>
                    )}
                    {/* Three-dot menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenDropdown(openDropdown === plan.id ? null : plan.id)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Dropdown menu */}
                      {openDropdown === plan.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-100 py-2 z-10">
                          <button
                            onClick={(e) => handleEditClick(plan.id, e)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all font-bold text-gray-900"
                          >
                            <Edit className="w-4 h-4 text-orange-600" />
                            Edit Plan
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(plan, e)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all font-bold text-gray-900"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            Delete Plan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-base">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-900 font-bold">
                      {getGoalLabel(plan.goal)}
                    </span>
                  </div>

                  {plan.race_date && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-semibold">
                        Race: {format(parseISO(plan.race_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-semibold">
                      {format(parseISO(plan.start_date), 'MMM d')} - {format(parseISO(plan.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">
                      Created {format(parseISO(plan.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && planToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase">
              Delete Plan?
            </h3>
            <p className="text-lg text-gray-700 mb-2 font-medium">
              Are you sure you want to delete <span className="font-black text-orange-600">"{planToDelete.plan_name}"</span>?
            </p>
            <p className="text-base text-gray-600 mb-8">
              This action cannot be undone. Your workout history will be preserved.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all hover:scale-105 transform disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-black hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform disabled:opacity-50 uppercase"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
