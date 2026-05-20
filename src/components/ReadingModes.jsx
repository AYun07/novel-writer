import { useState, useEffect, useRef } from 'react'
import { X, Moon, Sun, Type, Maximize, Minimize, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function ReadingMode({ onClose }) {
  const { chapters, activeChapterId } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(18)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const contentRef = useRef(null)

  const currentChapter = chapters.find(ch => ch.id === activeChapterId)
    || chapters[currentIndex]
    || { title: '未选择章节', content: '' }

  const currentChapterIndex = chapters.findIndex(ch => ch.id === activeChapterId)
  const actualIndex = currentChapterIndex >= 0 ? currentChapterIndex : currentIndex

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const content = stripHtml(currentChapter.content || '')
  const paragraphs = content.split('\n\n').filter(p => p.trim())

  const goPrev = () => {
    if (actualIndex > 0) {
      setCurrentIndex(actualIndex - 1)
      const prevChapter = chapters[actualIndex - 1]
      if (prevChapter) {
        useAppStore.getState().setActiveChapterId(prevChapter.id)
      }
    }
  }

  const goNext = () => {
    if (actualIndex < chapters.length - 1) {
      setCurrentIndex(actualIndex + 1)
      const nextChapter = chapters[actualIndex + 1]
      if (nextChapter) {
        useAppStore.getState().setActiveChapterId(nextChapter.id)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goPrev()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goNext()
      } else if (e.key === '+' || e.key === '=') {
        setFontSize(prev => Math.min(prev + 2, 32))
      } else if (e.key === '-') {
        setFontSize(prev => Math.max(prev - 2, 12))
      } else if (e.key === 'f') {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actualIndex])

  return (
    <div className={`fixed inset-0 z-50 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-[#fdfbf7]'}`}>
      {/* 顶部工具栏 */}
      <div className={`h-16 flex items-center justify-between px-6 transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white/80 text-gray-700'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-opacity-20 hover:bg-gray-500 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">阅读模式</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Type className="w-4 h-4" />
            <button onClick={() => setFontSize(prev => Math.max(prev - 2, 12))} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              A-
            </button>
            <span className="w-12 text-center">{fontSize}px</span>
            <button onClick={() => setFontSize(prev => Math.min(prev + 2, 32))} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              A+
            </button>
          </div>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 style={{ fontSize }} className={`font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {currentChapter.title || '未命名章节'}
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              第 {actualIndex + 1} 章 / 共 {chapters.length} 章
            </p>
          </div>

          <div ref={contentRef} className="space-y-6" style={{ fontSize }}>
            {paragraphs.map((para, i) => (
              <p 
                key={i} 
                className={`leading-relaxed text-justify indent-8 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <div className={`h-20 flex items-center justify-between px-6 transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white/80 text-gray-700'}`}>
        <button 
          onClick={goPrev} 
          disabled={actualIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${actualIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">上一章</span>
        </button>

        <div className="text-sm">
          {chapters[actualIndex - 1] && <span className="opacity-60">{chapters[actualIndex - 1].title}</span>}
          {chapters[actualIndex - 1] && chapters[actualIndex + 1] && <span className="mx-4">|</span>}
          {chapters[actualIndex + 1] && <span className="opacity-60">{chapters[actualIndex + 1].title}</span>}
        </div>

        <button 
          onClick={goNext} 
          disabled={actualIndex === chapters.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${actualIndex === chapters.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          <span className="text-sm">下一章</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export function FocusMode({ onClose }) {
  const { chapters, activeChapterId, updateChapter } = useAppStore()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [startTime] = useState(Date.now())

  const currentChapter = chapters.find(ch => ch.id === activeChapterId)
    || { title: '未选择章节', content: '' }

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const currentContent = stripHtml(currentChapter.content || '')
  const words = currentContent.replace(/\s/g, '').length

  const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000)

  return (
    <div className={`fixed inset-0 z-50 transition-colors duration-300 ${isDarkMode ? 'bg-gray-950' : 'bg-[#f8f6f0]'}`}>
      {/* 顶部状态栏 */}
      <div className={`h-14 flex items-center justify-between px-8 transition-colors ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white/80 text-gray-600'}`}>
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">{currentChapter.title || '未命名章节'}</span>
        </div>

        <div className="flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">字数:</span>
            <span className="font-mono font-medium">{words.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">时间:</span>
            <span className="font-mono font-medium">{elapsedMinutes}分</span>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 flex items-start justify-center pt-16 pb-16 overflow-y-auto">
        <div className="w-full max-w-3xl px-8">
          <textarea
            value={currentContent}
            onChange={(e) => {
              const newContent = e.target.value
              if (currentChapter.id) {
                updateChapter(currentChapter.id, { content: newContent })
              }
            }}
            placeholder="开始写作..."
            className={`w-full min-h-[70vh] bg-transparent border-none outline-none resize-none text-xl leading-relaxed ${isDarkMode ? 'text-gray-100 placeholder-gray-700' : 'text-gray-800 placeholder-gray-300'}`}
            style={{ fontSize: '18px', lineHeight: '1.9' }}
          />
        </div>
      </div>

      {/* 底部提示 */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        按 ESC 退出专注模式
      </div>
    </div>
  )
}
