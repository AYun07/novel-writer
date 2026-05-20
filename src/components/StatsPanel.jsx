import { useState, useEffect } from 'react'
import { TrendingUp, Target, Clock, Award, Flame, Calendar, Edit3, CheckCircle, ChevronRight, Star } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

export default function StatsPanel() {
  const { chapters, activeChapterId, setShowToast } = useAppStore()
  const [stats, setStats] = useState({
    totalWords: 0,
    totalChapters: 0,
    completedChapters: 0,
    dailyGoal: 2000,
    todayWords: 0,
    weeklyGoal: 10000,
    weeklyWords: 0,
    streak: 0,
    longestStreak: 0,
    totalWritingTime: 0,
    averageWordsPerDay: 0,
    lastWrittenDate: null,
    writingHistory: []
  })
  const [showGoalSettings, setShowGoalSettings] = useState(false)
  const [newGoal, setNewGoal] = useState(stats.dailyGoal)

  useEffect(() => {
    calculateStats()
    loadWritingHistory()
  }, [chapters])

  const calculateStats = () => {
    const totalWords = chapters.reduce((sum, chapter) => {
      const text = chapter.content?.replace(/<[^>]*>/g, '') || ''
      return sum + text.length
    }, 0)

    const completedChapters = chapters.filter(ch => ch.isCompleted).length

    setStats(prev => ({
      ...prev,
      totalWords,
      totalChapters: chapters.length,
      completedChapters
    }))
  }

  const loadWritingHistory = () => {
    const history = JSON.parse(localStorage.getItem('writing-history') || '[]')
    
    const today = new Date().toDateString()
    const todayWords = history
      .filter(h => new Date(h.date).toDateString() === today)
      .reduce((sum, h) => sum + h.words, 0)
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weeklyWords = history
      .filter(h => new Date(h.date) >= weekAgo)
      .reduce((sum, h) => sum + h.words, 0)
    
    const streak = calculateStreak(history)
    const longestStreak = Math.max(streak, parseInt(localStorage.getItem('longest-streak') || '0'))
    
    setStats(prev => ({
      ...prev,
      todayWords,
      weeklyWords,
      streak,
      longestStreak,
      writingHistory: history
    }))
  }

  const calculateStreak = (history) => {
    if (history.length === 0) return 0
    
    const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date))
    const uniqueDates = [...new Set(sortedHistory.map(h => new Date(h.date).toDateString()))]
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      
      if (new Date(uniqueDates[i]).toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const recordWriting = (words) => {
    const today = new Date().toISOString().split('T')[0]
    const history = JSON.parse(localStorage.getItem('writing-history') || '[]')
    
    const todayIndex = history.findIndex(h => h.date === today)
    if (todayIndex >= 0) {
      history[todayIndex].words += words
    } else {
      history.push({ date: today, words })
    }
    
    localStorage.setItem('writing-history', JSON.stringify(history))
    
    if (stats.streak > stats.longestStreak) {
      localStorage.setItem('longest-streak', stats.streak.toString())
    }
    
    loadWritingHistory()
  }

  const handleSetGoal = () => {
    const settings = JSON.parse(localStorage.getItem('integrated-author-settings') || '{}')
    settings.dailyGoal = newGoal
    localStorage.setItem('integrated-author-settings', JSON.stringify(settings))
    
    setStats(prev => ({ ...prev, dailyGoal: newGoal }))
    setShowGoalSettings(false)
    setShowToast('写作目标已更新', 'success')
  }

  const getProgressPercentage = (current, goal) => {
    return Math.min(100, Math.round((current / goal) * 100))
  }

  const getMotivationalMessage = () => {
    const progress = getProgressPercentage(stats.todayWords, stats.dailyGoal)
    
    if (progress === 0) {
      return '开始今天的写作吧！🚀'
    } else if (progress < 30) {
      return '加油！你可以的！💪'
    } else if (progress < 60) {
      return '不错！继续保持！✨'
    } else if (progress < 100) {
      return '就差一点点了！🎯'
    } else {
      return '太棒了！今日目标达成！🏆'
    }
  }

  return (
    <div className="space-y-6">
      {/* 写作目标 */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            今日目标
          </h3>
          <button
            onClick={() => setShowGoalSettings(true)}
            className="text-xs text-primary hover:underline"
          >
            设置目标
          </button>
        </div>
        
        <div className="relative h-4 bg-white/50 rounded-full overflow-hidden mb-2">
          <div 
            className={cn(
              "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
              getProgressPercentage(stats.todayWords, stats.dailyGoal) >= 100 
                ? "bg-success" 
                : "bg-primary"
            )}
            style={{ width: `${getProgressPercentage(stats.todayWords, stats.dailyGoal)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">
            {stats.todayWords.toLocaleString()} / {stats.dailyGoal.toLocaleString()} 字
          </span>
          <span className="font-medium text-primary">
            {getProgressPercentage(stats.todayWords, stats.dailyGoal)}%
          </span>
        </div>
        
        <p className="text-center mt-3 text-sm text-primary font-medium">
          {getMotivationalMessage()}
        </p>
      </div>

      {/* 连续写作天数 */}
      {stats.streak > 0 && (
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">{stats.streak} 天</span>
              </div>
              <p className="text-xs text-text-muted">连续写作</p>
            </div>
            {stats.streak >= stats.longestStreak && stats.streak > 1 && (
              <div className="flex items-center gap-1 text-xs text-orange-500">
                <Star className="w-4 h-4" />
                新纪录！
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-text-muted">
            最长连续：{stats.longestStreak} 天
          </div>
        </div>
      )}

      {/* 统计数据 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Edit3 className="w-4 h-4 text-info" />
            <span className="text-xs text-text-muted">总字数</span>
          </div>
          <div className="text-xl font-bold text-info">
            {stats.totalWords.toLocaleString()}
          </div>
        </div>

        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-text-muted">已完成</span>
          </div>
          <div className="text-xl font-bold text-success">
            {stats.completedChapters}/{stats.totalChapters}
          </div>
        </div>

        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-text-muted">本周字数</span>
          </div>
          <div className="text-xl font-bold text-primary">
            {stats.weeklyWords.toLocaleString()}
          </div>
        </div>

        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-secondary" />
            <span className="text-xs text-text-muted">本周进度</span>
          </div>
          <div className="text-xl font-bold text-secondary">
            {getProgressPercentage(stats.weeklyWords, stats.weeklyGoal)}%
          </div>
        </div>
      </div>

      {/* 本周进度条 */}
      <div className="bg-bg-secondary rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">本周目标</span>
          <span className="text-xs text-text-muted">
            {stats.weeklyWords.toLocaleString()} / {stats.weeklyGoal.toLocaleString()}
          </span>
        </div>
        <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-secondary rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage(stats.weeklyWords, stats.weeklyGoal)}%` }}
          />
        </div>
      </div>

      {/* 写作成就提示 */}
      {stats.totalWords >= 10000 && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="font-semibold text-yellow-500">🎉 里程碑达成！</div>
              <p className="text-sm text-text-muted">你已经写了 {(stats.totalWords / 10000).toFixed(1)} 万字！</p>
            </div>
          </div>
        </div>
      )}

      {/* 目标设置弹窗 */}
      {showGoalSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowGoalSettings(false)} />
          <div className="relative bg-bg-primary rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">设置每日目标</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">每日目标（字）</label>
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(parseInt(e.target.value) || 0)}
                min="100"
                max="100000"
                step="100"
                className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowGoalSettings(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                取消
              </button>
              <button
                onClick={handleSetGoal}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}