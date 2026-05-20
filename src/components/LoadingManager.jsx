import { createContext, useContext, useState, useCallback } from 'react'
import { LoadingOverlay, ProgressBar } from './Skeleton'

const LoadingContext = createContext(null)

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  const startLoading = useCallback((msg = '加载中...') => {
    setMessage(msg)
    setProgress(0)
    setLoading(true)
  }, [])

  const updateProgress = useCallback((value, msg) => {
    setProgress(value)
    if (msg) setMessage(msg)
  }, [])

  const finishLoading = useCallback(() => {
    setProgress(100)
    setTimeout(() => {
      setLoading(false)
      setMessage('')
      setProgress(0)
    }, 300)
  }, [])

  return (
    <LoadingContext.Provider value={{ 
      loading, 
      message, 
      progress,
      startLoading,
      updateProgress,
      finishLoading 
    }}>
      {children}
      {loading && (
        <LoadingOverlay message={message}>
          {progress > 0 && (
            <div className="mt-4 w-full max-w-xs">
              <ProgressBar progress={progress} />
            </div>
          )}
        </LoadingOverlay>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

export function withLoading(Component, loadingMessage = '加载中...') {
  return function LoadingComponent(props) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const handleLoad = useCallback(() => {
      setIsLoading(false)
    }, [])

    const handleError = useCallback((err) => {
      setError(err)
      setIsLoading(false)
    }, [])

    if (error) {
      return (
        <div className="p-8 text-center">
          <p className="text-danger mb-4">加载失败: {error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            重新加载
          </button>
        </div>
      )
    }

    return (
      <>
        {isLoading && (
          <div className="animate-pulse p-8">
            <Component {...props} onLoad={handleLoad} onError={handleError} />
          </div>
        )}
        {!isLoading && (
          <Component {...props} onLoad={handleLoad} onError={handleError} />
        )}
      </>
    )
  }
}
