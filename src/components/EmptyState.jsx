import { FileText, Users, Settings, BookOpen, Search, Folder } from 'lucide-react'
import { cn } from '../lib/utils'

const iconMap = {
  'chapters': FileText,
  'characters': Users,
  'world': Settings,
  'novel': BookOpen,
  'search': Search,
  'folder': Folder,
  'default': FileText
}

export default function EmptyState({ 
  type = 'default',
  title,
  description,
  action,
  onAction,
  className 
}) {
  const Icon = iconMap[type] || iconMap.default

  const defaultContent = {
    chapters: {
      title: '暂无章节',
      description: '开始你的创作之旅，创建第一个章节吧',
      actionLabel: '创建章节'
    },
    characters: {
      title: '暂无角色',
      description: '为你的故事添加鲜活的角色',
      actionLabel: '添加角色'
    },
    world: {
      title: '暂无世界观设定',
      description: '构建独特的世界观，丰富你的故事背景',
      actionLabel: '添加设定'
    },
    novel: {
      title: '暂无作品信息',
      description: '完善作品信息，让读者更了解你的创作',
      actionLabel: '添加信息'
    },
    search: {
      title: '没有找到结果',
      description: '换个关键词试试，或者调整筛选条件',
      actionLabel: null
    },
    folder: {
      title: '暂无内容',
      description: '这里还是空的，快来添加内容吧',
      actionLabel: '添加内容'
    },
    default: {
      title: '暂无内容',
      description: '这里还没有内容',
      actionLabel: null
    }
  }

  const content = defaultContent[type] || defaultContent.default

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      className
    )}>
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary/60" />
      </div>
      
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {title || content.title}
      </h3>
      
      <p className="text-sm text-text-secondary max-w-md mb-6">
        {description || content.description}
      </p>
      
      {(action || content.actionLabel) && (
        <button
          onClick={action || onAction}
          className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          {action?.label || content.actionLabel}
        </button>
      )}

      <div className="mt-8 p-4 bg-accent/5 border border-accent/20 rounded-lg max-w-sm">
        <p className="text-xs text-accent/80">
          💡 提示：{type === 'chapters' && '使用 Ctrl+Shift+N 可以快速创建新章节'}
          {type === 'characters' && '详细的角色设定能让AI更好地理解你的故事'}
          {type === 'world' && '完善的世界观能让故事更加立体真实'}
          {type === 'search' && '尝试使用更通用的关键词'}
          {!['chapters', 'characters', 'world', 'search'].includes(type) && '快捷键 Ctrl+S 可以快速保存'}
        </p>
      </div>
    </div>
  )
}
