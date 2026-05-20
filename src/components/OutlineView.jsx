import { useState, useMemo } from 'react'
import { List, ListOrdered, ChevronRight, ChevronDown, Plus, Edit3, Trash2, Save } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

export default function OutlineView() {
  const { chapters, activeChapterId, setActiveChapterId, updateChapter } = useAppStore()
  const [expandedChapter, setExpandedChapter] = useState(null)
  const [editingOutline, setEditingOutline] = useState(null)
  const [outlineContent, setOutlineContent] = useState('')

  const parseOutline = (content) => {
    if (!content) return []
    const lines = content.split('\n').filter(line => line.trim())
    const outline = []
    let currentLevel = 0
    let stack = [{ children: outline }]

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed) return
      
      let level = 0
      while (line.startsWith('  ')) {
        level++
        line = line.slice(2)
      }
      while (line.startsWith('#')) {
        level++
        line = line.slice(1)
      }

      while (stack.length > level + 1) {
        stack.pop()
      }

      const item = {
        title: trimmed,
        children: []
      }

      stack[stack.length - 1].children.push(item)
      stack.push(item)
    })

    return outline
  }

  const activeChapter = useMemo(() => 
    chapters.find(ch => ch.id === activeChapterId),
    [chapters, activeChapterId]
  )

  const currentOutline = useMemo(() => 
    activeChapter ? parseOutline(activeChapter.outline || '') : [],
    [activeChapter]
  )

  const renderOutlineItem = (item, depth = 0) => (
    <div key={item.title} className="ml-4">
      <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-bg-secondary cursor-pointer">
        {item.children && item.children.length > 0 && (
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
        )}
        <span style={{ fontSize: Math.max(12, 16 - depth * 2) }} className="text-text-primary">
          {item.title}
        </span>
      </div>
      {item.children && item.children.map(child => renderOutlineItem(child, depth + 1))}
    </div>
  )

  const saveOutline = () => {
    if (!activeChapterId) return
    updateChapter(activeChapterId, { outline: outlineContent })
    setEditingOutline(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">大纲视图</h3>
        </div>
        <div className="flex items-center gap-2">
          {editingOutline ? (
            <>
              <button
                onClick={saveOutline}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-sm rounded hover:bg-primary/90"
              >
                <Save className="w-3.5 h-3.5" />
                保存
              </button>
              <button
                onClick={() => setEditingOutline(null)}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
              >
                取消
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setOutlineContent(activeChapter?.outline || '')
                setEditingOutline(true)
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-bg-secondary text-text-primary text-sm rounded hover:bg-bg-tertiary"
            >
              <Edit3 className="w-3.5 h-3.5" />
              编辑
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {editingOutline ? (
          <textarea
            value={outlineContent}
            onChange={(e) => setOutlineContent(e.target.value)}
            placeholder="输入大纲，每行一个标题，使用缩进或#表示层级..."
            className="w-full h-full min-h-96 p-4 bg-bg-secondary border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        ) : (
          <div className="space-y-1">
            {currentOutline.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">暂无大纲</p>
                <button
                  onClick={() => {
                    setOutlineContent('')
                    setEditingOutline(true)
                  }}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  点击创建大纲
                </button>
              </div>
            ) : (
              currentOutline.map(item => renderOutlineItem(item))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
