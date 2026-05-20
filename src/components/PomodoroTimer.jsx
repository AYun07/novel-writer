import { useState, useEffect, useRef } from 'react'
import { X, Play, Pause, RotateCcw, Clock, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function PomodoroTimer({ onClose }) {
  const { 
    pomodoroTime, 
    setPomodoroTime, 
    isPomodoroRunning, 
    setIsPomodoroRunning 
  } = useAppStore()

  const [timeLeft, setTimeLeft] = useState(pomodoroTime * 60)
  const [currentCycle, setCurrentCycle] = useState('work')
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const timerRef = useRef(null)

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const startTimer = () => {
    if (isPomodoroRunning) {
      clearInterval(timerRef.current)
      setIsPomodoroRunning(false)
    } else {
      setIsPomodoroRunning(true)
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsPomodoroRunning(false)
            
            if (currentCycle === 'work') {
              setCyclesCompleted(prev => prev + 1)
              setCurrentCycle('break')
              return 5 * 60
            } else {
              setCurrentCycle('work')
              return pomodoroTime * 60
            }
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const resetTimer = () => {
    clearInterval(timerRef.current)
    setIsPomodoroRunning(false)
    setTimeLeft(currentCycle === 'work' ? pomodoroTime * 60 : 5 * 60)
  }

  const switchMode = () => {
    clearInterval(timerRef.current)
    setIsPomodoroRunning(false)
    if (currentCycle === 'work') {
      setCurrentCycle('break')
      setTimeLeft(5 * 60)
    } else {
      setCurrentCycle('work')
      setTimeLeft(pomodoroTime * 60)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const getProgressPercent = () => {
    const total = currentCycle === 'work' ? pomodoroTime * 60 : 5 * 60
    return Math.round(((total - timeLeft) / total) * 100)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-text-primary">番茄钟</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* 模式选择 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setCurrentCycle('work')
                setTimeLeft(pomodoroTime * 60)
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                currentCycle === 'work'
                  ? 'bg-primary text-white'
                  : 'bg-bg-secondary text-text-muted hover:bg-bg-tertiary'
              }`}
            >
              专注工作
            </button>
            <button
              onClick={() => {
                setCurrentCycle('break')
                setTimeLeft(5 * 60)
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                currentCycle === 'break'
                  ? 'bg-green-500 text-white'
                  : 'bg-bg-secondary text-text-muted hover:bg-bg-tertiary'
              }`}
            >
              休息
            </button>
          </div>

          {/* 计时器 */}
          <div className="text-center mb-6">
            <div className="relative w-48 h-48 mx-auto mb-4">
              {/* 圆环进度 */}
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-bg-secondary"
                  fill="none"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className="stroke-primary"
                  fill="none"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgressPercent() / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-text-primary font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <p className="text-text-muted">
              {currentCycle === 'work' ? '专注模式 - 高效工作' : '休息模式 - 放松一下'}
            </p>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={resetTimer}
              className="p-3 bg-bg-secondary rounded-full hover:bg-bg-tertiary transition-colors"
              title="重置"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={startTimer}
              className={`p-5 rounded-full transition-all ${
                isPomodoroRunning
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-primary text-white hover:bg-primary-hover'
              }`}
            >
              {isPomodoroRunning ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current" />
              )}
            </button>
          </div>

          {/* 周期统计 */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-primary">{cyclesCompleted}</p>
              <p className="text-xs text-text-muted">已完成</p>
            </div>
            <div className="p-3 bg-bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-green-500">{currentCycle === 'work' ? '🎯' : '☕'}</p>
              <p className="text-xs text-text-muted">当前阶段</p>
            </div>
            <div className="p-3 bg-bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-yellow-500">{getProgressPercent()}%</p>
              <p className="text-xs text-text-muted">进度</p>
            </div>
          </div>

          {/* 时长设置 */}
          <div className="mt-6 pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-primary mb-3">
              工作时长（分钟）
            </label>
            <div className="flex items-center gap-3">
              {[20, 25, 30, 45].map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setPomodoroTime(time)
                    if (currentCycle === 'work') {
                      setTimeLeft(time * 60)
                    }
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pomodoroTime === time
                      ? 'bg-primary text-white'
                      : 'bg-bg-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  {time}分钟
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              番茄工作法: 专注工作25分钟，休息5分钟，完成4个番茄钟后休息15-30分钟
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
