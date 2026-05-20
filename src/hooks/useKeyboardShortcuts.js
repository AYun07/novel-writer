import { useEffect, useCallback, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useKeyboardShortcuts() {
  const {
    setSidebarOpen,
    setAiSidebarOpen,
    sidebarOpen,
    aiSidebarOpen,
    setShowToast,
    chapters,
    activeChapterId,
    updateChapter,
    setShowSettings
  } = useAppStore()
  
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

  const handleSave = useCallback(() => {
    const { chapters, outline, characters, worldSettings, novelInfo } = useAppStore.getState()
    
    localStorage.setItem('integrated-author-autosave', JSON.stringify({
      chapters,
      outline,
      characters,
      worldSettings,
      novelInfo,
      lastSaved: new Date().toISOString()
    }))
    
    setShowToast('文档已保存', 'success')
  }, [setShowToast])

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen)
  }, [sidebarOpen, setSidebarOpen])

  const handleToggleAiSidebar = useCallback(() => {
    setAiSidebarOpen(!aiSidebarOpen)
  }, [aiSidebarOpen, setAiSidebarOpen])

  const handleNewChapter = useCallback(() => {
    const { chapters, setChapters } = useAppStore.getState()
    const newChapter = {
      id: `chapter-${Date.now()}`,
      title: `第${chapters.length + 1}章：新的章节`,
      content: '<p></p>',
      generatedText: '',
      isCompleted: false,
      createdAt: new Date().toISOString()
    }
    setChapters([...chapters, newChapter])
    useAppStore.setState({ activeChapterId: newChapter.id })
    setShowToast('新章节已创建', 'success')
  }, [setShowToast])

  const handleDeleteChapter = useCallback(() => {
    const { chapters, activeChapterId, setChapters, setActiveChapterId } = useAppStore.getState()
    
    if (chapters.length <= 1) {
      setShowToast('至少需要保留一个章节', 'warning')
      return
    }
    
    const confirmDelete = window.confirm('确定要删除当前章节吗？')
    if (!confirmDelete) return
    
    const currentIndex = chapters.findIndex(ch => ch.id === activeChapterId)
    const newChapters = chapters.filter(ch => ch.id !== activeChapterId)
    setChapters(newChapters)
    
    const newActiveIndex = Math.min(currentIndex, newChapters.length - 1)
    setActiveChapterId(newChapters[newActiveIndex]?.id || null)
    setShowToast('章节已删除', 'success')
  }, [setShowToast])

  const handleToggleChapterComplete = useCallback(() => {
    const { chapters, activeChapterId, updateChapter } = useAppStore.getState()
    const chapter = chapters.find(ch => ch.id === activeChapterId)
    
    if (chapter) {
      updateChapter(activeChapterId, { isCompleted: !chapter.isCompleted })
      setShowToast(chapter.isCompleted ? '章节已标记为未完成' : '章节已完成', 'success')
    }
  }, [setShowToast])

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true)
  }, [setShowSettings])

  const handleShowShortcutsHelp = useCallback(() => {
    setShowShortcutsHelp(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMod = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey
      const isAlt = e.altKey
      const key = e.key.toLowerCase()

      if (isMod && key === 's' && !isAlt) {
        e.preventDefault()
        handleSave()
        return
      }

      if (isMod && key === 'b' && !isAlt) {
        e.preventDefault()
        document.execCommand('bold')
        return
      }

      if (isMod && key === 'i' && !isAlt) {
        e.preventDefault()
        document.execCommand('italic')
        return
      }

      if (isMod && key === 'u' && !isAlt) {
        e.preventDefault()
        document.execCommand('underline')
        return
      }

      if (isMod && key === '\\') {
        e.preventDefault()
        handleToggleSidebar()
        return
      }

      if (isMod && key === 'k' && !isAlt) {
        e.preventDefault()
        handleToggleAiSidebar()
        return
      }

      if (isMod && isShift && key === 'n') {
        e.preventDefault()
        handleNewChapter()
        return
      }

      if (isMod && isShift && key === 'd') {
        e.preventDefault()
        handleDeleteChapter()
        return
      }

      if (isMod && key === ',') {
        e.preventDefault()
        handleOpenSettings()
        return
      }

      if (isMod && isShift && key === '/') {
        e.preventDefault()
        handleShowShortcutsHelp()
        return
      }

      if (key === 'f5') {
        e.preventDefault()
        handleSave()
        return
      }

      if (e.key === 'Escape') {
        setShowShortcutsHelp(false)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    handleSave, 
    handleToggleSidebar, 
    handleToggleAiSidebar, 
    handleNewChapter, 
    handleDeleteChapter,
    handleOpenSettings,
    handleShowShortcutsHelp
  ])

  return {
    showShortcutsHelp,
    setShowShortcutsHelp,
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: '保存文档', category: '通用' },
      { keys: ['Ctrl', 'B'], description: '加粗', category: '格式' },
      { keys: ['Ctrl', 'I'], description: '斜体', category: '格式' },
      { keys: ['Ctrl', 'U'], description: '下划线', category: '格式' },
      { keys: ['Ctrl', '\\'], description: '切换左侧面板', category: '视图' },
      { keys: ['Ctrl', 'K'], description: '切换AI助手', category: '视图' },
      { keys: ['Ctrl', 'Shift', 'N'], description: '新建章节', category: '章节' },
      { keys: ['Ctrl', 'Shift', 'D'], description: '删除章节', category: '章节' },
      { keys: ['Ctrl', ','], description: '打开设置', category: '通用' },
      { keys: ['Ctrl', 'Shift', '/'], description: '显示快捷键帮助', category: '通用' },
      { keys: ['F5'], description: '快速保存', category: '通用' },
      { keys: ['Esc'], description: '关闭弹窗/帮助', category: '通用' }
    ]
  }
}

export default useKeyboardShortcuts
