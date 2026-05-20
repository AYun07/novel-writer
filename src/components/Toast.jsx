import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, Bell, Clock, Download, Upload, RefreshCw, Zap, User } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Clock,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  zap: Zap,
  user: User,
  notification: Bell
}

const colors = {
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-danger/10 border-danger/30 text-danger',
  warning: 'bg-warning/10 border-warning/30 text-warning',
  info: 'bg-info/10 border-info/30 text-info',
  loading: 'bg-primary/10 border-primary/30 text-primary',
  download: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
  upload: 'bg-green-500/10 border-green-500/30 text-green-500',
  refresh: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
  zap: 'bg-purple-500/10 border-purple-500/30 text-purple-500',
  user: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500',
  notification: 'bg-gray-500/10 border-gray-500/30 text-gray-500'
}

export default function Toast() {
  const { toast, setToast } = useAppStore()
  const [visibleToasts, setVisibleToasts] = useState([])

  useEffect(() => {
    if (toast) {
      const newToast = {
        ...toast,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }
      
      setVisibleToasts(prev => [...prev.slice(-4), newToast])
      
      const duration = toast.duration || 3000
      setTimeout(() => {
        setVisibleToasts(prev => prev.filter(t => t.id !== newToast.id))
      }, duration)
    }
  }, [toast])

  const handleClose = (id) => {
    setVisibleToasts(prev => prev.filter(t => t.id !== id))
    if (setToast) {
      setToast(null)
    }
  }

  if (visibleToasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleToasts.map((toastItem) => {
        const Icon = icons[toastItem.type] || icons.info
        const colorClass = colors[toastItem.type] || colors.info
        
        return (
          <div 
            key={toastItem.id}
            className="animate-slide-in"
          >
            <div className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg",
              colorClass
            )}>
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 mt-0.5",
                toastItem.type === 'loading' && 'animate-spin'
              )} />
              <div className="flex-1 min-w-0">
                {toastItem.title && (
                  <p className="text-sm font-semibold mb-1">{toastItem.title}</p>
                )}
                <p className="text-sm font-medium break-words">{toastItem.message}</p>
                {toastItem.subtitle && (
                  <p className="text-xs opacity-70 mt-1">{toastItem.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => handleClose(toastItem.id)}
                className="p-1 rounded hover:bg-black/10 transition-colors"
              >
                <XCircle className="w-4 h-4 opacity-50 hover:opacity-100" />
              </button>
            </div>
          </div>
        )
      })}

      <style>{`
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
        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-out {
          animation: slide-out 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}