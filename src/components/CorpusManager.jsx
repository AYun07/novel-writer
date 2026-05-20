import { useState } from 'react'
import { X, Database, Plus, Trash2, Edit3, Save, Search, FileText, Copy, Check } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import dynamic from 'next/dynamic'

const EmptyState = dynamic(() => import('./EmptyState'), {
  ssr: false,
  loading: () => <div className="py-12"><div className="animate-pulse space-y-3"><div className="h-20 bg-bg-secondary rounded-lg"></div><div className="h-24 bg-bg-secondary rounded-lg"></div></div></div>
})

export default function CorpusManager() {
  const { 
    showCorpusModal, 
    setShowCorpusModal,
    corpus,
    addCorpus,
    removeCorpus,
    setShowToast
  } = useAppStore()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source: '',
    category: 'writing_sample'
  })
  const [editingId, setEditingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const categories = [
    { value: 'writing_sample', label: '写作参考' },
    { value: 'style_guide', label: '文风指南' },
    { value: 'dialogue', label: '对话素材' },
    { value: 'description', label: '描写素材' },
    { value: 'plot_idea', label: '剧情灵感' },
    { value: 'character_ref', label: '人物参考' },
    { value: 'world_ref', label: '世界观参考' },
    { value: 'other', label: '其他' }
  ]

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      source: '',
      category: 'writing_sample'
    })
    setEditingId(null)
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      setShowToast('请输入语料标题', 'warning')
      return
    }
    if (!formData.content.trim()) {
      setShowToast('请输入语料内容', 'warning')
      return
    }

    if (editingId) {
      const updated = corpus.map(item => 
        item.id === editingId 
          ? { ...item, ...formData }
          : item
      )
      useAppStore.setState({ corpus: updated })
      setShowToast('语料已更新', 'success')
    } else {
      addCorpus(formData)
      setShowToast('语料已添加', 'success')
    }

    resetForm()
  }

  const handleEdit = (item) => {
    setFormData({
      title: item.title || '',
      content: item.content || '',
      source: item.source || '',
      category: item.category || 'writing_sample'
    })
    setEditingId(item.id)
  }

  const handleDelete = (id) => {
    if (confirm('确定要删除这条语料吗？')) {
      removeCorpus(id)
      setShowToast('语料已删除', 'info')
    }
  }

  const handleCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
      setShowToast('已复制到剪贴板', 'success')
    } catch (error) {
      setShowToast('复制失败', 'error')
    }
  }

  const filteredCorpus = corpus.filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.title?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.source?.toLowerCase().includes(query)
    )
  })

  const getCategoryLabel = (value) => {
    return categories.find(c => c.value === value)?.label || value
  }

  const getCategoryColor = (value) => {
    const colors = {
      writing_sample: 'bg-primary/10 text-primary',
      style_guide: 'bg-secondary/10 text-secondary',
      dialogue: 'bg-success/10 text-success',
      description: 'bg-info/10 text-info',
      plot_idea: 'bg-warning/10 text-warning',
      character_ref: 'bg-danger/10 text-danger',
      world_ref: 'bg-purple-500/10 text-purple-500',
      other: 'bg-gray-500/10 text-gray-500'
    }
    return colors[value] || colors.other
  }

  if (!showCorpusModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowCorpusModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">语料库管理</h2>
            <span className="text-sm text-text-muted">({corpus.length} 条语料)</span>
          </div>
          <button 
            onClick={() => setShowCorpusModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 语料列表 */}
          <div className="w-1/2 border-r border-border overflow-y-auto">
            {/* 搜索 */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索语料..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* 列表内容 */}
            <div className="p-4 space-y-3">
              <button
                onClick={resetForm}
                className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加新语料
              </button>

              {filteredCorpus.length === 0 ? (
                <EmptyState
                  type="folder"
                  className="py-8"
                  title={searchQuery ? '未找到匹配的语料' : '暂无语料'}
                  description={searchQuery ? '尝试其他搜索词' : '添加语料来提升AI创作质量'}
                  action={!searchQuery ? {
                    label: '添加语料',
                    onClick: resetForm
                  } : undefined}
                />
              ) : (
                filteredCorpus.map((item) => (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg p-4 hover:bg-bg-secondary transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${getCategoryColor(item.category)}`}>
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(item)}
                          className="p-1.5 hover:bg-bg-tertiary rounded"
                          title="复制内容"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 hover:bg-bg-tertiary rounded"
                          title="编辑"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 hover:bg-danger/10 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-danger" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-text-muted line-clamp-3">
                      {item.content}
                    </p>
                    {item.source && (
                      <p className="text-xs text-text-muted mt-2">
                        来源：{item.source}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 编辑表单 */}
          <div className="w-1/2 overflow-y-auto p-6">
            <div className="max-w-xl mx-auto space-y-6">
              <h3 className="text-lg font-medium">
                {editingId ? '编辑语料' : '添加新语料'}
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">
                  语料标题 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="为这条语料起一个描述性的标题"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">语料分类</label>
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
                  语料内容 <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="粘贴或输入语料内容..."
                  rows={12}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none font-mono text-sm"
                />
                <p className="text-xs text-text-muted mt-1">
                  字数：{formData.content.length}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">来源</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="例如：书籍名称、网址、作者等（可选）"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* 快速模板 */}
              <div className="p-4 bg-bg-secondary rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  快速添加模板
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '精彩对话', title: '对话素材', content: '场景：\n人物A：\n人物B：\n' },
                    { label: '环境描写', title: '描写素材', content: '场景：\n时间：\n天气：\n描写：' },
                    { label: '人物刻画', title: '写作参考', content: '人物：\n外貌：\n动作：\n心理：' },
                    { label: '剧情灵感', title: '剧情灵感', content: '灵感描述：\n可能的发展：\n相关章节：' }
                  ].map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          title: template.title,
                          content: template.content
                        })
                      }}
                      className="p-2 text-left text-sm border border-border rounded hover:bg-bg-tertiary transition-colors"
                    >
                      {template.label}
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
                  {editingId ? '保存修改' : '添加语料'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
