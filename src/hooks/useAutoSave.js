import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useAutoSave(interval = 300000) {
  const { chapters, outline, characters, worldSettings, novelInfo, setShowToast, addVersionHistory } = useAppStore()
  const lastSaveRef = useRef(null)
  const autoSaveEnabledRef = useRef(true)
  const lastVersionSaveRef = useRef(0)

  const saveToLocalStorage = useCallback(() => {
    const currentData = {
      chapters,
      outline,
      characters,
      worldSettings,
      novelInfo,
      lastSaved: new Date().toISOString()
    }

    const dataString = JSON.stringify(currentData)
    
    if (dataString !== lastSaveRef.current) {
      try {
        localStorage.setItem('integrated-author-autosave', dataString)
        lastSaveRef.current = dataString
        
        const settings = JSON.parse(localStorage.getItem('integrated-author-settings') || '{}')
        settings.lastAutoBackup = new Date().toISOString()
        localStorage.setItem('integrated-author-settings', JSON.stringify(settings))
        
        console.log('自动保存成功:', new Date().toLocaleTimeString())
        
        // 每10次自动保存创建一次版本快照
        lastVersionSaveRef.current++
        if (lastVersionSaveRef.current >= 10) {
          addVersionHistory({
            type: 'auto',
            title: `自动保存 ${new Date().toLocaleString('zh-CN')}`,
            chapters: JSON.parse(dataString).chapters,
            wordCount: JSON.parse(dataString).chapters.reduce((sum, ch) => sum + ((ch.content || '').replace(/<[^>]*>/g, '').length), 0)
          })
          lastVersionSaveRef.current = 0
        }
      } catch (error) {
        console.error('自动保存失败:', error)
      }
    }
  }, [chapters, outline, characters, worldSettings, novelInfo, addVersionHistory])

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem('integrated-author-autosave')
      if (savedData) {
        const data = JSON.parse(savedData)
        
        if (data.lastSaved) {
          const lastSavedDate = new Date(data.lastSaved)
          const now = new Date()
          const timeDiff = now - lastSavedDate
          
          if (timeDiff < 3600000) {
            const timeAgo = Math.floor(timeDiff / 60000)
            setShowToast(`已自动恢复上次编辑 (${timeAgo}分钟前)`, 'info')
          }
        }
        
        return data
      }
    } catch (error) {
      console.error('加载自动保存数据失败:', error)
    }
    return null
  }, [setShowToast])

  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem('integrated-author-autosave')
      lastSaveRef.current = null
    } catch (error) {
      console.error('清除自动保存失败:', error)
    }
  }, [])

  const enableAutoSave = useCallback(() => {
    autoSaveEnabledRef.current = true
  }, [])

  const disableAutoSave = useCallback(() => {
    autoSaveEnabledRef.current = false
  }, [])

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('integrated-author-settings') || '{}')
    if (!savedSettings.autoSave) {
      autoSaveEnabledRef.current = false
      return
    }

    const intervalId = setInterval(() => {
      if (autoSaveEnabledRef.current) {
        saveToLocalStorage()
      }
    }, interval)

    return () => clearInterval(intervalId)
  }, [interval, saveToLocalStorage])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (autoSaveEnabledRef.current) {
        saveToLocalStorage()
        
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saveToLocalStorage])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && autoSaveEnabledRef.current) {
        saveToLocalStorage()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [saveToLocalStorage])

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearAutoSave,
    enableAutoSave,
    disableAutoSave
  }
}

export function useWritingStats() {
  const { chapters } = useAppStore()
  
  const calculateStats = useCallback(() => {
    const totalWords = chapters.reduce((sum, chapter) => {
      const text = chapter.content?.replace(/<[^>]*>/g, '') || ''
      return sum + text.length
    }, 0)
    
    const completedChapters = chapters.filter(ch => ch.isCompleted).length
    const totalChapters = chapters.length
    
    return {
      totalWords,
      totalChapters,
      completedChapters,
      completionRate: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
      averageWordsPerChapter: totalChapters > 0 ? Math.round(totalWords / totalChapters) : 0
    }
  }, [chapters])

  const stats = calculateStats()

  return stats
}

export function useWritingHistory() {
  const recordWriting = useCallback((words) => {
    const today = new Date().toISOString().split('T')[0]
    const history = JSON.parse(localStorage.getItem('writing-history') || '[]')
    
    const todayIndex = history.findIndex(h => h.date === today)
    if (todayIndex >= 0) {
      history[todayIndex].words += words
      history[todayIndex].updatedAt = new Date().toISOString()
    } else {
      history.push({
        date: today,
        words,
        updatedAt: new Date().toISOString()
      })
    }
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const filteredHistory = history.filter(h => new Date(h.date) >= thirtyDaysAgo)
    
    localStorage.setItem('writing-history', JSON.stringify(filteredHistory))
    
    updateStreak(filteredHistory)
  }, [])

  const updateStreak = (history) => {
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
    
    const currentStreak = parseInt(localStorage.getItem('writing-streak') || '0')
    if (streak > currentStreak) {
      localStorage.setItem('writing-streak', streak.toString())
      localStorage.setItem('longest-streak', Math.max(streak, parseInt(localStorage.getItem('longest-streak') || '0')).toString())
    }
    
    return streak
  }

  const getHistory = useCallback((days = 30) => {
    const history = JSON.parse(localStorage.getItem('writing-history') || '[]')
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return history
      .filter(h => new Date(h.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [])

  const getStreak = useCallback(() => {
    const history = JSON.parse(localStorage.getItem('writing-history') || '[]')
    return updateStreak(history)
  }, [])

  const getLongestStreak = useCallback(() => {
    return parseInt(localStorage.getItem('longest-streak') || '0')
  }, [])

  return {
    recordWriting,
    getHistory,
    getStreak,
    getLongestStreak
  }
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        const { chapters, outline, characters, worldSettings, novelInfo } = useAppStore.getState()
        
        localStorage.setItem('integrated-author-autosave', JSON.stringify({
          chapters,
          outline,
          characters,
          worldSettings,
          novelInfo,
          lastSaved: new Date().toISOString()
        }))
        
        useAppStore.getState().showToast('已保存', 'success')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

export default useAutoSave