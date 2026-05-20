import { useState } from 'react'
import { Trophy, CheckCircle, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function Achievements({ onClose }) {
  const { achievements } = useAppStore()

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const progressPercent = Math.round((unlockedCount / totalCount) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <h2 className="text-xl font-bold text-text-primary">成就系统</h2>
              <p className="text-sm text-text-muted">
                {unlockedCount}/{totalCount} 已解锁 ({progressPercent}%)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 bg-bg-secondary border-b border-border">
          <div className="w-full bg-bg-tertiary rounded-full h-2.5">
            <div 
              className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-bg-secondary border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    achievement.unlocked ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-bg-tertiary'
                  }`}>
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${
                        achievement.unlocked ? 'text-yellow-700 dark:text-yellow-400' : 'text-text-muted'
                      }`}>
                        {achievement.name}
                      </h3>
                      {achievement.unlocked && (
                        <CheckCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-text-muted mb-2">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-text-muted">
                        解锁于: {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AchievementNotification({ achievement, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-200 dark:bg-yellow-800/50 flex items-center justify-center text-2xl">
            🏆
          </div>
          <div className="flex-1">
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">成就解锁！</p>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">
              {achievement.name}
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
              {achievement.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-yellow-700 dark:text-yellow-500 hover:text-yellow-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
