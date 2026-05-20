'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAppStore } from '../store/useAppStore'
import { onAuthStateChangedHandler } from '../lib/firebase'
import { Menu, Sparkles, X, Search } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAutoSave } from '../hooks/useAutoSave'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

const Sidebar = dynamic(() => import('../components/Sidebar'), {
  loading: () => <div className="w-72 bg-bg-sidebar h-screen animate-pulse" />,
  ssr: false
})

const Editor = dynamic(() => import('../components/Editor'), {
  loading: () => <div className="flex-1 bg-bg-primary animate-pulse" />,
  ssr: false
})

const AISidebar = dynamic(() => import('../components/AISidebar'), {
  loading: () => <div className="w-72 bg-bg-sidebar h-screen animate-pulse" />,
  ssr: false
})

const SettingsModal = dynamic(() => import('../components/SettingsModal'), {
  loading: () => null,
  ssr: false
})

const LoginModal = dynamic(() => import('../components/LoginModal'), {
  loading: () => null,
  ssr: false
})

const ExportModal = dynamic(() => import('../components/ExportModal'), {
  loading: () => null,
  ssr: false
})

const BackupRestore = dynamic(() => import('../components/BackupRestore'), {
  loading: () => null,
  ssr: false
})

const CharacterManager = dynamic(() => import('../components/CharacterManager'), {
  loading: () => null,
  ssr: false
})

const WorldSettingsManager = dynamic(() => import('../components/WorldSettingsManager'), {
  loading: () => null,
  ssr: false
})

const NovelInfoManager = dynamic(() => import('../components/NovelInfoManager'), {
  loading: () => null,
  ssr: false
})

const CorpusManager = dynamic(() => import('../components/CorpusManager'), {
  loading: () => null,
  ssr: false
})

const SessionManager = dynamic(() => import('../components/SessionManager'), {
  loading: () => null,
  ssr: false
})

const TemplateManager = dynamic(() => import('../components/TemplateManager'), {
  loading: () => null,
  ssr: false
})

const TimelineView = dynamic(() => import('../components/TimelineView'), {
  loading: () => null,
  ssr: false
})

const StatsPanel = dynamic(() => import('../components/StatsPanel'), {
  loading: () => <div className="w-80 bg-bg-secondary animate-pulse" />,
  ssr: false
})

const Toast = dynamic(() => import('../components/Toast'), {
  loading: () => null,
  ssr: false
})

const KeyboardShortcutsHelp = dynamic(() => import('../components/KeyboardShortcutsHelp'), {
  loading: () => null,
  ssr: false
})

const GlobalSearch = dynamic(() => import('../components/GlobalSearch'), {
  loading: () => null,
  ssr: false
})

const Keyboard = require('lucide-react').Keyboard

export default function Home() {
  const { 
    chapters = [], 
    activeChapterId, 
    updateChapter,
    showSettings, 
    showLoginModal,
    showTimelineModal,
    setChapters,
    setShowToast,
    setSidebarOpen,
    setAiSidebarOpen
  } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)

  useAutoSave(300000)
  const { showShortcutsHelp, setShowShortcutsHelp, shortcuts } = useKeyboardShortcuts()

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowGlobalSearch(true)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const activeChapter = chapters?.length > 0 ? chapters.find(ch => ch.id === activeChapterId) : null

  const handleContentChange = (content) => {
    if (activeChapterId) {
      updateChapter(activeChapterId, { content })
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHandler((user) => {
      if (user) {
        setShowToast(`欢迎回来，${user.displayName || user.email}`, 'success')
      }
      setIsLoading(false)
    })

    if (!chapters || chapters.length === 0) {
      const defaultChapters = [
        {
          id: '1',
          title: '第一章：序幕',
          content: '<p>故事开始于一个平凡的早晨...</p>',
          generatedText: '',
          isCompleted: false,
          createdAt: new Date().toISOString()
        }
      ]
      setChapters(defaultChapters)
    }

    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <AISidebar />

      <header className="fixed top-0 left-0 right-0 z-20 lg:hidden border-b border-border bg-bg-secondary px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text-primary">
            {activeChapter?.title || '未命名章节'}
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAiSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </button>
            <button 
              onClick={() => setShowMobileMenu(true)}
              className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-bg-sidebar p-4 space-y-2">
            <button 
              onClick={() => {
                setShowMobileMenu(false)
                setSidebarOpen(true)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-sidebar-hover transition-colors"
            >
              <Menu className="w-5 h-5" />
              <span>侧边栏</span>
            </button>
            <button 
              onClick={() => {
                setShowMobileMenu(false)
                setAiSidebarOpen(true)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-sidebar-hover transition-colors"
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span>AI助手</span>
            </button>
            <div className="border-t border-border-dark my-2" />
            <button 
              onClick={() => setShowMobileMenu(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-text-muted"
            >
              <X className="w-4 h-4" />
              <span>关闭菜单</span>
            </button>
          </div>
        </div>
      )}

      <main className={cn(
        "min-h-screen transition-all duration-300",
        "lg:ml-72 lg:mr-72",
        "md:ml-72 md:mr-0",
        "sm:ml-0 sm:mr-0",
        "pt-0 lg:pt-0",
        "pt-16 lg:pt-0"
      )}>
        <header className={cn(
          "border-b border-border bg-bg-secondary px-6 py-4",
          "hidden lg:block"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                {activeChapter?.title || '未命名章节'}
              </h1>
              <p className="text-sm text-text-muted mt-1">
                {chapters?.length || 0} 个章节
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowGlobalSearch(true)}
                className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-text-muted hover:text-text-primary"
                title="搜索 (Ctrl+F)"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowShortcutsHelp(true)}
                className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-text-muted hover:text-text-primary"
                title="键盘快捷键"
              >
                <Keyboard className="w-5 h-5" />
              </button>
              <span className="text-sm text-text-muted">
                字数: {activeChapter?.content ? activeChapter.content.replace(/<[^>]*>/g, '').length : 0}
              </span>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)]">
          <div className={cn(
            "flex-1",
            "lg:pr-4"
          )}>
            <Editor
              content={activeChapter?.content || ''}
              onChange={handleContentChange}
              placeholder="开始写作..."
            />
          </div>
          
          <div className={cn(
            "w-80 border-l border-border bg-bg-secondary p-4 overflow-y-auto",
            "hidden lg:block"
          )}>
            <StatsPanel />
          </div>
        </div>
      </main>

      {showSettings && <SettingsModal />}
      {showLoginModal && <LoginModal />}
      <ExportModal />
      <BackupRestore />
      <CharacterManager />
      <WorldSettingsManager />
      <NovelInfoManager />
      <CorpusManager />
      <SessionManager />
      <TemplateManager />
      
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => useAppStore.getState().setShowTimelineModal(false)} />
          <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <TimelineView />
          </div>
        </div>
      )}
      
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        shortcuts={shortcuts}
      />
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
      <Toast />
    </div>
  )
}