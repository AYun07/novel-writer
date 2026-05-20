import { useState } from 'react'
import { Calendar, TrendingUp, Award } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function WritingHeatmap() {
  const { writingStats, writingGoals } = useAppStore()
  const [selectedDate, setSelectedDate] = useState(null)

  const getLast365Days = () => {
    const days = []
    for (let i = 364; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        count: writingStats[dateStr] || 0
      })
    }
    return days
  }

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-bg-tertiary'
    if (count < 500) return 'bg-green-200'
    if (count < 1500) return 'bg-green-400'
    if (count < 3000) return 'bg-green-600'
    return 'bg-green-800'
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const days = getLast365Days()
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const totalWords = Object.values(writingStats).reduce((sum, count) => sum + count, 0)
  const activeDays = Object.keys(writingStats).filter(date => writingStats[date] > 0).length
  const maxDaily = Math.max(...Object.values(writingStats), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">写作统计热力图</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-bg-secondary rounded-lg">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>总字数</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{totalWords.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-bg-secondary rounded-lg">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Award className="w-4 h-4" />
            <span>活跃天数</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{activeDays} 天</div>
        </div>
        <div className="p-4 bg-bg-secondary rounded-lg">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Award className="w-4 h-4" />
            <span>单日最高</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{maxDaily.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">过去 365 天</h3>
          <div className="flex items-center gap-2 text-xs">
            <span>少</span>
            <div className="w-3 h-3 bg-bg-tertiary rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
            <span>多</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={day.date}
                    onClick={() => setSelectedDate(day)}
                    className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)} hover:scale-125 transition-transform cursor-pointer`}
                    title={`${formatDate(day.date)}: ${day.count.toLocaleString()} 字`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{formatDate(selectedDate.date)}</div>
              <div className="text-sm text-text-muted">{selectedDate.count.toLocaleString()} 字</div>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-text-muted hover:text-text-primary"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {writingGoals.daily > 0 && (
        <div className="bg-bg-secondary rounded-lg p-4">
          <h3 className="font-semibold mb-3">写作目标</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>每日目标: {writingGoals.daily.toLocaleString()} 字</span>
                <span>今日进度</span>
              </div>
              <div className="w-full bg-bg-tertiary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(((writingStats[new Date().toISOString().split('T')[0]] || 0) / writingGoals.daily) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="text-xs text-text-muted mt-1">
                {((writingStats[new Date().toISOString().split('T')[0]] || 0) / writingGoals.daily * 100).toFixed(0)}% 完成
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
