import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, FileText, Users, Settings, X, Highlight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn, debounce } from '../lib/utils'

const searchIcons = {
  chapters: FileText,
  characters: Users,
  world: Settings,
  templates: FileText,
  corpus: FileText
}

const searchColors = {
  chapters: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  characters: 'bg-green-500/10 text-green-500 border-green-500/30',
  world: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  templates: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  corpus: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'
}

export default function GlobalSearch({ isOpen, onClose }) {
  const {
    chapters,
    characters,
    worldSettings,
    templates,
    corpus,
    setActiveChapterId,
    setShowCharacterModal,
    setShowWorldModal
  } = useAppStore()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  const performSearch = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const lowerQuery = searchQuery.toLowerCase()
    const searchResults = []

    chapters.forEach(chapter => {
      if (
        chapter.title?.toLowerCase().includes(lowerQuery) ||
        chapter.content?.toLowerCase().includes(lowerQuery)
      ) {
        const highlightedContent = highlightMatch(chapter.content || '', lowerQuery)
        searchResults.push({
          type: 'chapters',
          id: chapter.id,
          title: chapter.title,
          preview: highlightedContent.substring(0, 100),
          data: chapter
        })
      }
    })

    characters.forEach(char => {
      if (
        char.name?.toLowerCase().includes(lowerQuery) ||
        char.personality?.toLowerCase().includes(lowerQuery) ||
        char.background?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'characters',
          id: char.id,
          title: char.name,
          preview: char.personality?.substring(0, 80) || char.background?.substring(0, 80),
          data: char
        })
      }
    })

    worldSettings.forEach(setting => {
      if (
        setting.title?.toLowerCase().includes(lowerQuery) ||
        setting.content?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'world',
          id: setting.id,
          title: setting.title,
          preview: setting.content?.substring(0, 80),
          data: setting
        })
      }
    })

    templates.forEach(template => {
      if (
        template.name?.toLowerCase().includes(lowerQuery) ||
        template.content?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'templates',
          id: template.id,
          title: template.name,
          preview: template.content?.substring(0, 80),
          data: template
        })
      }
    })

    corpus.forEach(item => {
      if (
        item.title?.toLowerCase().includes(lowerQuery) ||
        item.content?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'corpus',
          id: item.id,
          title: item.title,
          preview: item.content?.substring(0, 80),
          data: item
        })
      }
    })

    setResults(searchResults.slice(0, 20))
    setLoading(false)
    setSelectedIndex(0)
  }, [chapters, characters, worldSettings, templates, corpus])

  const debouncedSearch = useCallback(
    debounce((query) => performSearch(query), 300),
    [performSearch]
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const highlightMatch = (text, query) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-500/30 text-yellow-600 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleSelect = (result) => {
    switch (result.type) {
      case 'chapters':
        setActiveChapterId(result.id)
        break
      case 'characters':
        setShowCharacterModal(true)
        break
      case 'world':
        setShowWorldModal(true)
        break
      default:
        break
    }
    onClose()
    setQuery('')
  }

  const getTypeLabel = (type) => {
    const labels = {
      chapters: '章节',
      characters: '角色',
      world: '世界观',
      templates: '模板',
      corpus: '语料'
    }
    return labels[type] || type
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <div 
        className="bg-bg-secondary rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索章节、角色、世界观..."
              className="w-full pl-10 pr-10 py-3 bg-bg-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              aria-label="全局搜索"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-bg-secondary rounded"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            )}
          </div>
        </div>

        <div 
          ref={resultsRef}
          className="max-h-96 overflow-y-auto"
          role="listbox"
        >
          {loading && (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-text-secondary mt-2">搜索中...</p>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary">未找到匹配的结果</p>
              <p className="text-sm text-text-muted mt-1">尝试其他关键词</p>
            </div>
          )}

          {!loading && !query && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary">输入关键词开始搜索</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-bg-primary rounded-full text-xs text-text-muted">
                  支持：章节、角色、世界观、模板、语料
                </span>
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = searchIcons[result.type] || FileText
                const colorClass = searchColors[result.type] || ''

                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={cn(
                      "mx-2 mb-1 p-3 rounded-lg cursor-pointer transition-all",
                      "hover:bg-bg-primary",
                      selectedIndex === index && "bg-bg-primary ring-2 ring-primary"
                    )}
                    onClick={() => handleSelect(result)}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg border", colorClass.split(' ')[0])}>
                        <Icon className={cn("w-4 h-4", colorClass.split(' ')[1])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-text-primary truncate">
                            {highlightMatch(result.title, query)}
                          </span>
                          <span className={cn("text-xs px-2 py-0.5 rounded border", colorClass)}>
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        {result.preview && (
                          <p className="text-sm text-text-secondary line-clamp-2">
                            {highlightMatch(result.preview, query)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border bg-bg-primary/50">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-bg-secondary rounded border">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-bg-secondary rounded border">↓</kbd>
                导航
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-bg-secondary rounded border">Enter</kbd>
                选择
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-bg-secondary rounded border">Esc</kbd>
                关闭
              </span>
            </div>
            <span>找到 {results.length} 个结果</span>
          </div>
        </div>
      </div>
    </div>
  )
}
