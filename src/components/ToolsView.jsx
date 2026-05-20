import { useState } from 'react'
import { X, Layout, List, ListOrdered, FileText, Users, Clock, Calendar, BarChart3, History } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'
import dynamic from 'next/dynamic'

const OutlineView = dynamic(() => import('./OutlineView'), { ssr: false })
const SceneCards = dynamic(() => import('./SceneCards'), { ssr: false })
const CharacterRelationsGraph = dynamic(() => import('./CharacterRelationsGraph'), { ssr: false })
const TimelineView = dynamic(() => import('./TimelineView'), { ssr: false })
const WritingHeatmap = dynamic(() => import('./WritingHeatmap'), { ssr: false })
const VersionHistory = dynamic(() => import('./VersionHistory'), { ssr: false })

const tools = [
  { id: 'outline', name: '大纲视图', icon: ListOrdered, component: OutlineView },
  { id: 'scenes', name: '场景卡', icon: FileText, component: SceneCards },
  { id: 'relations', name: '角色关系', icon: Users, component: CharacterRelationsGraph },
  { id: 'timeline', name: '时间轴', icon: Calendar, component: TimelineView },
  { id: 'stats', name: '写作统计', icon: BarChart3, component: WritingHeatmap },
  { id: 'history', name: '版本历史', icon: History, component: VersionHistory }
]

export default function ToolsView() {
  const [activeTool, setActiveTool] = useState('outline')
  const { setShowToast } = useAppStore()

  const ActiveComponent = tools.find(t => t.id === activeTool)?.component

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">创作工具</h3>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 工具列表 */}
        <div className="w-48 border-r border-border p-3 space-y-1 bg-bg-secondary">
          {tools.map(tool => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors",
                  activeTool === tool.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                <span className="text-sm">{tool.name}</span>
              </button>
            )
          })}
        </div>

        {/* 工具内容 */}
        <div className="flex-1 overflow-hidden">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  )
}
