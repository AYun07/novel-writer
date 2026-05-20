'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Editor from '../components/Editor'
import AISidebar from '../components/AISidebar'
import SettingsModal from '../components/SettingsModal'
import LoginModal from '../components/LoginModal'
import ExportModal from '../components/ExportModal'
import BackupRestore from '../components/BackupRestore'
import CharacterManager from '../components/CharacterManager'
import WorldSettingsManager from '../components/WorldSettingsManager'
import NovelInfoManager from '../components/NovelInfoManager'
import CorpusManager from '../components/CorpusManager'
import SessionManager from '../components/SessionManager'
import TemplateManager from '../components/TemplateManager'
import StatsPanel from '../components/StatsPanel'
import Toast from '../components/Toast'
import { useAppStore } from '../store/useAppStore'
import { onAuthStateChangedHandler } from '../lib/firebase'

export default function Home() {
  const { 
    chapters = [], 
    activeChapterId, 
    updateChapter,
    showSettings, 
    showLoginModal,
    setChapters,
    setShowToast
  } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)

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
      
      <main className="ml-72 mr-72 min-h-screen">
        <header className="border-b border-border bg-bg-secondary px-6 py-4">
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
              <span className="text-sm text-text-muted">
                字数: {activeChapter?.content ? activeChapter.content.replace(/<[^>]*>/g, '').length : 0}
              </span>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          <div className="flex-1">
            <Editor
              content={activeChapter?.content || ''}
              onChange={handleContentChange}
              placeholder="开始写作..."
            />
          </div>
          
          <div className="w-80 border-l border-border bg-bg-secondary p-4 overflow-y-auto hidden lg:block">
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
      <Toast />
    </div>
  )
}