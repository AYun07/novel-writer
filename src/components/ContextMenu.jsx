import { useState, useEffect, useRef } from 'react'
import { 
  Copy, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  FileText,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function ContextMenu({ 
  x, 
  y, 
  items, 
  onClose,
  data 
}) {
  const menuRef = useRef(null)
  const [position, setPosition] = useState({ x, y })

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let newX = x
      let newY = y

      if (x + rect.width > viewportWidth) {
        newX = viewportWidth - rect.width - 10
      }

      if (y + rect.height > viewportHeight) {
        newY = viewportHeight - rect.height - 10
      }

      setPosition({ x: Math.max(10, newX), y: Math.max(10, newY) })
    }
  }, [x, y])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleItemClick = (item) => {
    if (item.disabled) return
    item.onClick?.(data)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-50 bg-bg-secondary rounded-lg shadow-xl border border-border",
        "py-1 min-w-[180px] animate-in fade-in slide-in-from-top-1 duration-150"
      )}
      style={{ left: position.x, top: position.y }}
      role="menu"
    >
      {items.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <div 
              key={`divider-${index}`} 
              className="h-px bg-border my-1 mx-2"
            />
          )
        }

        const Icon = item.icon || MoreHorizontal

        return (
          <button
            key={item.id || index}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors",
              item.disabled 
                ? "text-text-muted cursor-not-allowed opacity-50" 
                : "text-text-primary hover:bg-bg-primary"
            )}
            role="menuitem"
          >
            {item.icon && (
              <Icon className={cn("w-4 h-4", item.color || "text-text-secondary")} />
            )}
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-text-muted">{item.shortcut}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState(null)

  const showContextMenu = (e, items, data = null) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items,
      data
    })
  }

  const hideContextMenu = () => {
    setContextMenu(null)
  }

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  }
}

export const chapterContextMenuItems = [
  {
    id: 'edit',
    label: '编辑',
    icon: Edit3,
    shortcut: 'Enter'
  },
  {
    id: 'copy',
    label: '复制',
    icon: Copy,
    shortcut: 'Ctrl+C'
  },
  {
    id: 'duplicate',
    label: '复制章节',
    icon: FileText
  },
  {
    type: 'divider'
  },
  {
    id: 'toggle-complete',
    label: '标记完成',
    icon: Eye
  },
  {
    id: 'export',
    label: '导出章节',
    icon: Download
  },
  {
    type: 'divider'
  },
  {
    id: 'delete',
    label: '删除',
    icon: Trash2,
    color: 'text-danger',
    shortcut: 'Del'
  }
]

export const characterContextMenuItems = [
  {
    id: 'edit',
    label: '编辑角色',
    icon: Edit3
  },
  {
    id: 'copy',
    label: '复制',
    icon: Copy
  },
  {
    type: 'divider'
  },
  {
    id: 'view-relations',
    label: '查看关系',
    icon: ExternalLink
  },
  {
    id: 'export',
    label: '导出',
    icon: Download
  },
  {
    type: 'divider'
  },
  {
    id: 'delete',
    label: '删除',
    icon: Trash2,
    color: 'text-danger'
  }
]
