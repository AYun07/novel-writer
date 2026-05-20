import { useState } from 'react'
import { Clock, Calendar, Plus, Edit3, Trash2, X, Save } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function TimelineView() {
  const { timeline, setTimeline, setShowToast } = useAppStore()
  const [editingId, setEditingId] = useState(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    description: '',
    relatedCharacters: [],
    relatedChapters: [],
    importance: 'normal'
  })

  const addEvent = () => {
    if (!formData.title.trim() || !formData.date.trim()) {
      setShowToast('请填写事件标题和时间', 'warning')
      return
    }

    const newEvent = {
      id: Date.now().toString(),
      ...formData,
      createdAt: Date.now()
    }

    setTimeline(prev => [...prev, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date)))
    setShowToast('事件已添加到时间轴', 'success')
    resetForm()
  }

  const updateEvent = () => {
    if (!editingId) return
    
    setTimeline(prev => prev.map(e => 
      e.id === editingId ? { ...e, ...formData } : e
    ).sort((a, b) => new Date(a.date) - new Date(b.date)))
    setShowToast('事件已更新', 'success')
    resetForm()
  }

  const deleteEvent = (id) => {
    if (confirm('确定要删除这个时间事件吗？')) {
      setTimeline(prev => prev.filter(e => e.id !== id))
      setShowToast('事件已删除', 'info')
    }
  }

  const editEvent = (event) => {
    setFormData(event)
    setEditingId(event.id)
    setShowAddEvent(true)
  }

  const resetForm = () => {
    setFormData({
      date: '',
      title: '',
      description: '',
      relatedCharacters: [],
      relatedChapters: [],
      importance: 'normal'
    })
    setEditingId(null)
    setShowAddEvent(false)
  }

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'critical': return '#ef4444'
      case 'important': return '#f59e0b'
      case 'normal': return '#3b82f6'
      case 'minor': return '#6b7280'
      default: return '#3b82f6'
    }
  }

  const getImportanceLabel = (importance) => {
    switch (importance) {
      case 'critical': return '关键事件'
      case 'important': return '重要事件'
      case 'normal': return '普通事件'
      case 'minor': return '次要事件'
      default: return '普通事件'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">时间轴</h3>
          <span className="text-sm text-text-muted">({timeline.length} 个事件)</span>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" />
          添加事件
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Clock className="w-16 h-16 text-text-muted mb-4" />
            <h4 className="text-lg font-medium text-text-primary mb-2">暂无时间线事件</h4>
            <p className="text-sm text-text-muted mb-4">添加事件来记录故事的关键时间节点</p>
            <button
              onClick={() => setShowAddEvent(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              添加第一个事件
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* 时间线中轴线 */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6 ml-12">
              {timeline.map((event, index) => (
                <div key={event.id} className="relative group">
                  {/* 时间点圆点 */}
                  <div 
                    className="absolute -left-10 top-2 w-6 h-6 rounded-full border-4 border-bg-primary"
                    style={{ backgroundColor: getImportanceColor(event.importance) }}
                  />
                  
                  {/* 事件卡片 */}
                  <div className="bg-bg-primary border border-border rounded-lg p-4 hover:border-primary/50 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ 
                            backgroundColor: `${getImportanceColor(event.importance)}15`,
                            color: getImportanceColor(event.importance)
                          }}>
                            {getImportanceLabel(event.importance)}
                          </span>
                          <span className="text-sm text-text-muted">{event.date}</span>
                        </div>
                        <h4 className="font-semibold text-text-primary">{event.title}</h4>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => editEvent(event)}
                          className="p-1.5 hover:bg-bg-secondary rounded"
                        >
                          <Edit3 className="w-4 h-4 text-text-secondary" />
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-1.5 hover:bg-bg-secondary rounded"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </button>
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-text-secondary mb-2">{event.description}</p>
                    )}
                    
                    {event.relatedCharacters && event.relatedCharacters.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.relatedCharacters.map(charId => (
                          <span key={charId} className="text-xs px-2 py-0.5 bg-bg-secondary rounded">
                            角色: {charId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 添加/编辑事件弹窗 */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={resetForm}>
          <div className="bg-bg-primary rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingId ? '编辑事件' : '添加时间事件'}
              </h3>
              <button onClick={resetForm} className="p-1.5 hover:bg-bg-secondary rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">时间</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">事件标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：主角相遇"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">重要程度</label>
                <select
                  value={formData.importance}
                  onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="critical">关键事件</option>
                  <option value="important">重要事件</option>
                  <option value="normal">普通事件</option>
                  <option value="minor">次要事件</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">事件描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述这个时间点发生了什么..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition"
              >
                取消
              </button>
              <button
                onClick={editingId ? updateEvent : addEvent}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                <Save className="w-4 h-4" />
                {editingId ? '保存修改' : '添加事件'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
