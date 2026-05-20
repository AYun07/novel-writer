import { cn } from '../lib/utils'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-bg-secondary via-bg-tertiary to-bg-secondary bg-[length:200%_100%] rounded",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 && "w-3/4"
          )} 
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn("p-4 bg-bg-secondary rounded-lg", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <SkeletonText lines={2} />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 5, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-8 h-8 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonEditor({ className }) {
  return (
    <div className={cn("p-6 space-y-6", className)}>
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/4" />
        <SkeletonText lines={4} />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/4" />
        <SkeletonText lines={3} />
      </div>
    </div>
  )
}

export function SkeletonSidebar({ className }) {
  return (
    <div className={cn("p-4 space-y-6", className)}>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-8 w-3/4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <div className="pt-4 space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonChapterList({ count = 6, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-4" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-6 h-6 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        sizeClasses[size],
        "border-4 border-primary border-t-transparent rounded-full animate-spin"
      )} />
    </div>
  )
}

export function LoadingOverlay({ message, className }) {
  return (
    <div className={cn(
      "fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="bg-bg-primary rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
        <LoadingSpinner size="lg" className="mb-4" />
        {message && (
          <p className="text-center text-text-secondary mt-4">{message}</p>
        )}
      </div>
    </div>
  )
}

export function ProgressBar({ progress, className, showLabel = true }) {
  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">加载进度</span>
          <span className="text-primary font-medium">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
