import { useState } from 'react'
import { X, Globe, Plus, Trash2, Edit3, Save, Tag, FileText } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import dynamic from 'next/dynamic'

const EmptyState = dynamic(() => import('./EmptyState'), {
  ssr: false,
  loading: () => <div className="py-12"><div className="animate-pulse space-y-3"><div className="h-20 bg-bg-secondary rounded-lg"></div><div className="h-24 bg-bg-secondary rounded-lg"></div></div></div>
})

export default function WorldSettingsManager() {
  const { 
    showWorldModal, 
    setShowWorldModal,
    worldSettings,
    setWorldSettings,
    setShowToast
  } = useAppStore()

  const [editingIndex, setEditingIndex] = useState(null)
  const [formData, setFormData] = useState({
    category: 'setting',
    title: '',
    content: ''
  })

  const [newCategory, setNewCategory] = useState('')

  const categories = [
    { value: 'setting', label: '地点设定' },
    { value: 'timeline', label: '时间线' },
    { value: 'culture', label: '文化习俗' },
    { value: 'magic', label: '力量体系' },
    { value: 'technology', label: '科技水平' },
    { value: 'politics', label: '政治势力' },
    { value: 'economy', label: '经济体系' },
    { value: 'other', label: '其他设定' }
  ]

  const resetForm = () => {
    setFormData({
      category: 'setting',
      title: '',
      content: ''
    })
    setEditingIndex(null)
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      setShowToast('请输入设定标题', 'warning')
      return
    }
    if (!formData.content.trim()) {
      setShowToast('请输入设定内容', 'warning')
      return
    }

    const newSetting = {
      id: Date.now().toString(),
      category: formData.category,
      title: formData.title.trim(),
      content: formData.content.trim(),
      createdAt: new Date().toISOString()
    }

    if (editingIndex !== null) {
      const updated = [...worldSettings]
      updated[editingIndex] = newSetting
      setWorldSettings(updated)
      setShowToast('设定已更新', 'success')
    } else {
      setWorldSettings([...worldSettings, newSetting])
      setShowToast('设定已添加', 'success')
    }

    resetForm()
  }

  const handleEdit = (index) => {
    const setting = worldSettings[index]
    setFormData({
      category: setting.category,
      title: setting.title,
      content: setting.content
    })
    setEditingIndex(index)
  }

  const handleDelete = (index) => {
    if (confirm('确定要删除这个设定吗？')) {
      const updated = worldSettings.filter((_, i) => i !== index)
      setWorldSettings(updated)
      setShowToast('设定已删除', 'info')
    }
  }

  const groupedSettings = worldSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {})

  const getCategoryLabel = (value) => {
    return categories.find(c => c.value === value)?.label || value
  }

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      categories.push({
        value: newCategory.toLowerCase().replace(/\s+/g, '_'),
        label: newCategory.trim()
      })
      setNewCategory('')
      setShowToast('分类已添加', 'success')
    }
  }

  if (!showWorldModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowWorldModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">世界观设定</h2>
            <span className="text-sm text-text-muted">({worldSettings.length} 项设定)</span>
          </div>
          <button 
            onClick={() => setShowWorldModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 设定列表 */}
          <div className="w-96 border-r border-border overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* 添加按钮 */}
              <button
                onClick={resetForm}
                className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加新设定
              </button>

              {/* 按分类显示设定 */}
              {categories.map(category => {
                const settings = groupedSettings[category.value] || []
                if (settings.length === 0) return null

                return (
                  <div key={category.value} className="space-y-2">
                    <h3 className="text-sm font-medium text-text-muted flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      {category.label}
                      <span className="text-xs">({settings.length})</span>
                    </h3>
                    <div className="space-y-1">
                      {settings.map((setting, idx) => {
                        const actualIndex = worldSettings.findIndex(s => 
                          s.id === setting.id && s.category === setting.category
                        )
                        return (
                          <div
                            key={setting.id}
                            className="p-3 border border-border rounded-lg hover:bg-bg-secondary cursor-pointer transition-colors group"
                            onClick={() => handleEdit(actualIndex)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{setting.title}</h4>
                                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                                  {setting.content}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(actualIndex)
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-danger/10 rounded transition-opacity"
                              >
                                <Trash2 className="w-3 h-3 text-danger" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {worldSettings.length === 0 && (
                <EmptyState
                  type="world"
                  className="py-8"
                  action={{
                    label: '添加设定',
                    onClick: resetForm
                  }}
                />
              )}
            </div>
          </div>

          {/* 设定编辑表单 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  设定分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  设定标题 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：首都长安、魔法体系、时间历法等"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  设定内容 <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="详细描述这个世界观设定的内容..."
                  rows={12}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                />
                <p className="text-xs text-text-muted mt-1">
                  字数：{formData.content.length}
                </p>
              </div>

              {/* 常用设定模板 */}
              <div className="p-4 bg-bg-secondary rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  快速添加模板
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { title: '地点：', content: '名称：\n地理位置：\n环境特点：\n重要场所：\n历史背景：' },
                    { title: '势力：', content: '名称：\n首领：\n规模：\n目标：\n特色：' },
                    { title: '种族：', content: '名称：\n外貌特征：\n生活习性：\n社会结构：\n能力特点：' },
                    { title: '物品：', content: '名称：\n外观：\n功能：\n来历：\n使用者：' }
                  ].map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          title: template.title.replace('：', ''),
                          content: template.content
                        })
                      }}
                      className="p-2 text-left text-sm border border-border rounded hover:bg-bg-tertiary transition-colors"
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingIndex !== null ? '保存修改' : '添加设定'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
