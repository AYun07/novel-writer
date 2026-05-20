import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const colors = {
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-danger/10 border-danger/30 text-danger',
  warning: 'bg-warning/10 border-warning/30 text-warning',
  info: 'bg-info/10 border-info/30 text-info'
}

export default function Toast() {
  const { toast } = useAppStore()

  if (!toast) return null

  const Icon = icons[toast.type] || icons.info
  const colorClass = colors[toast.type] || colors.info

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm",
        colorClass
      )}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{toast.message}</p>
      </div>

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
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}