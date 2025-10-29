'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, type, message }])

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 min-w-[320px] animate-slide-in ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                : toast.type === 'error'
                ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            )}

            <p
              className={`flex-1 font-bold text-base ${
                toast.type === 'success'
                  ? 'text-green-900'
                  : toast.type === 'error'
                  ? 'text-red-900'
                  : 'text-blue-900'
              }`}
            >
              {toast.message}
            </p>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
