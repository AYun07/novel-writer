import { useState, useEffect } from 'react'
import { BarChart2, BookOpen, FileText, Clock, Target, Zap, TrendingUp, UserCircle, Globe } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function StatsPanel() {
  const { chapters, characters, worldSettings, novelInfo, corpus } = useAppStore()
  const [stats, setStats] = useState({
    totalWords: 0,
    completeChapters: 0,
    totalChapters: 0,
    totalCharacters: 0,
    totalSettings: 0,
    totalCorpus: 0,
    writingDays: 0
  })

  useEffect(() => {
    calculateStats()
  }, [chapters, characters, worldSettings, novelInfo, corpus])

  const calculateStats = () => {
    let totalWords = 0
    const completeChapters = chapters.filter(ch => ch.isCompleted).length

    chapters.forEach(chapter => {
      if (chapter.content) {
        const plainText = chapter.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
        totalWords += plainText.replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length
      }
    })

    setStats({
      totalWords,
      completeChapters,
      totalChapters: chapters.length,
      totalCharacters: characters.length,
      totalSettings: worldSettings.length,
      totalCorpus: corpus.length,
      writingDays: 0
    })
  }

  const readingTime = Math.ceil(stats.totalWords / 400)

  return (
    <div className="bg-bg-secondary rounded-lg p-4 space-y-4 border border-border">
      <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-primary" />
        创作统计
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-primary rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <BookOpen className="w-3 h-3" />
            总字数
          </div>
          <div className="text-xl font-bold text-primary">
            {stats.totalWords.toLocaleString()}
          </div>
        </div>

        <div className="bg-bg-primary rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <Clock className="w-3 h-3" />
            阅读时间
          </div>
          <div className="text-xl font-bold text-text-primary">
            {readingTime} 分钟
          </div>
        </div>

        <div className="bg-bg-primary rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <FileText className="w-3 h-3" />
            完成章节
          </div>
          <div className="text-xl font-bold text-success">
            {stats.completeChapters} / {stats.totalChapters}
          </div>
        </div>

        <div className="bg-bg-primary rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <Target className="w-3 h-3" />
            完成率
          </div>
          <div className="text-xl font-bold text-secondary">
            {stats.totalChapters > 0 
              ? Math.round((stats.completeChapters / stats.totalChapters) * 100) 
              : 0}%
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <h4 className="text-xs font-medium text-text-muted">素材统计</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center bg-bg-primary rounded p-2 border border-border">
            <UserCircle className="w-3 h-3 mx-auto mb-1 text-primary" />
            <div className="text-sm font-bold">{stats.totalCharacters}</div>
            <div className="text-text-muted">角色</div>
          </div>
          <div className="text-center bg-bg-primary rounded p-2 border border-border">
            <Globe className="w-3 h-3 mx-auto mb-1 text-secondary" />
            <div className="text-sm font-bold">{stats.totalSettings}</div>
            <div className="text-text-muted">设定</div>
          </div>
          <div className="text-center bg-bg-primary rounded p-2 border border-border">
            <Zap className="w-3 h-3 mx-auto mb-1 text-info" />
            <div className="text-sm font-bold">{stats.totalCorpus}</div>
            <div className="text-text-muted">语料</div>
          </div>
        </div>
      </div>

      {stats.totalChapters > 0 && (
        <div className="border-t border-border pt-4">
          <div className="text-xs text-text-muted mb-2">章节完成进度</div>
          <div className="w-full bg-bg-sidebar-hover rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ 
                width: `${Math.min((stats.completeChapters / stats.totalChapters) * 100, 100)}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  )
}
