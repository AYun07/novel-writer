import { useState } from 'react'
import { X, FileText, Plus, Trash2, Edit3, Save, Copy, Check, FolderOpen } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'
import dynamic from 'next/dynamic'

const EmptyState = dynamic(() => import('./EmptyState'), {
  ssr: false,
  loading: () => <div className="py-12"><div className="animate-pulse space-y-3"><div className="h-20 bg-bg-secondary rounded-lg"></div><div className="h-24 bg-bg-secondary rounded-lg"></div></div></div>
})

export default function TemplateManager() {
  const { 
    showTemplateModal, 
    setShowTemplateModal,
    templates,
    setTemplates,
    setShowToast
  } = useAppStore()

  const [editingIndex, setEditingIndex] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'outline',
    content: ''
  })

  const categories = [
    { value: 'outline', label: '大纲模板' },
    { value: 'character', label: '角色模板' },
    { value: 'world', label: '世界观模板' },
    { value: 'chapter', label: '章节模板' },
    { value: 'dialogue', label: '对话模板' },
    { value: 'scene', label: '场景模板' },
    { value: 'other', label: '其他模板' }
  ]

  const defaultTemplates = [
    {
      name: '标准小说大纲',
      category: 'outline',
      content: `# 小说大纲

## 基本信息
- 标题：
- 类型：
- 目标读者：

## 故事背景
- 时间设定：
- 地点设定：
- 世界观：

## 主要角色
### 主角
- 姓名：
- 年龄：
- 性格特点：
- 背景故事：

### 配角
- 姓名：
- 与主角关系：
- 作用：

## 故事主线
### 第一阶段（开头）
- 主要事件：
- 目标：
- 冲突：

### 第二阶段（发展）
- 主要事件：
- 目标：
- 冲突：

### 第三阶段（高潮）
- 主要事件：
- 目标：
- 冲突：

### 第四阶段（结局）
- 主要事件：
- 结局类型：

## 伏笔设置
1.
2.
3.

## 主题思想
- 核心主题：
- 想要表达的思想：`
    },
    {
      name: '章节结构模板',
      category: 'chapter',
      content: `## 第X章：章节标题

### 开篇
- 场景：
- 时间：
- 人物：
- 情绪基调：

### 发展
- 主要事件1：
- 主要事件2：
- 主要事件3：

### 高潮
- 冲突爆发点：
- 转折点：

### 结尾
- 悬念设置：
- 章节小结：

### 章节字数目标：2000-3000字`
    },
    {
      name: '角色设定卡',
      category: 'character',
      content: `## 角色设定卡

### 基础信息
- 姓名：
- 性别：
- 年龄：
- 职业/身份：

### 外貌特征
- 身高：
- 体型：
- 发色/发型：
- 眼睛：
- 特殊标记：

### 性格特点
- 性格类型：
- 主要优点：
- 主要缺点：
- 习惯动作：
- 口头禅：

### 背景故事
- 出身：
- 教育背景：
- 重要经历：
- 成长转折点：

### 人物关系
- 家人：
- 朋友：
- 敌人：
- 爱人：

### 目标与动机
- 短期目标：
- 长期目标：
- 内心动机：

### 特殊能力/技能
- 能力1：
- 能力2：
- 能力3：`
    },
    {
      name: '场景描写模板',
      category: 'scene',
      content: `## 场景描写

### 基本信息
- 场景名称：
- 地理位置：
- 时间设定：

### 环境描写
#### 视觉
- 整体氛围：
- 光线效果：
- 重要物品：

#### 听觉
- 环境音：
- 特殊声音：

#### 嗅觉/味觉
- 气味：
- 味道（如果适用）：

#### 触觉
- 温度：
- 质感：

### 场景功能
- 推动剧情：
- 烘托气氛：
- 暗示信息：

### 场景转换
- 进入场景方式：
- 离开场景方式：`
    },
    {
      name: '对话模板',
      category: 'dialogue',
      content: `## 对话场景

### 基本信息
- 场景：
- 参与者：
- 对话目的：

### 对话内容
**人物A：**
> （动作/表情）

**人物B：**
> （动作/表情）

**人物A：**
> （动作/表情）

**人物B：**
> （动作/表情）

### 对话分析
- 潜台词：
- 情感变化：
- 信息传递：`
    }
  ]

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'outline',
      content: ''
    })
    setEditingIndex(null)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setShowToast('请输入模板名称', 'warning')
      return
    }
    if (!formData.content.trim()) {
      setShowToast('请输入模板内容', 'warning')
      return
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      category: formData.category,
      content: formData.content.trim(),
      createdAt: new Date().toISOString()
    }

    if (editingIndex !== null) {
      const updated = [...templates]
      updated[editingIndex] = newTemplate
      setTemplates(updated)
      setShowToast('模板已更新', 'success')
    } else {
      setTemplates([...templates, newTemplate])
      setShowToast('模板已添加', 'success')
    }

    resetForm()
  }

  const handleEdit = (index) => {
    const template = templates[index]
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content
    })
    setEditingIndex(index)
  }

  const handleDelete = (index) => {
    if (confirm('确定要删除这个模板吗？')) {
      const updated = templates.filter((_, i) => i !== index)
      setTemplates(updated)
      setShowToast('模板已删除', 'info')
    }
  }

  const handleCopy = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
      setShowToast('已复制到剪贴板', 'success')
    } catch (error) {
      setShowToast('复制失败', 'error')
    }
  }

  const handleUseTemplate = (template) => {
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content
    })
    setShowToast('已加载模板，可以修改后保存', 'info')
  }

  const loadDefaultTemplates = () => {
    if (confirm('确定要加载默认模板吗？这将添加5个常用模板。')) {
      setTemplates([...templates, ...defaultTemplates])
      setShowToast('默认模板已加载', 'success')
    }
  }

  const filteredTemplates = templates.filter(t => {
    const selectedCategory = formData.category
    return !selectedCategory || selectedCategory === 'all' || t.category === selectedCategory
  })

  const getCategoryLabel = (value) => {
    return categories.find(c => c.value === value)?.label || value
  }

  const getCategoryColor = (value) => {
    const colors = {
      outline: 'bg-primary/10 text-primary',
      character: 'bg-secondary/10 text-secondary',
      world: 'bg-success/10 text-success',
      chapter: 'bg-info/10 text-info',
      dialogue: 'bg-warning/10 text-warning',
      scene: 'bg-purple-500/10 text-purple-500',
      other: 'bg-gray-500/10 text-gray-500'
    }
    return colors[value] || colors.other
  }

  if (!showTemplateModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowTemplateModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">模板管理</h2>
            <span className="text-sm text-text-muted">({templates.length} 个模板)</span>
          </div>
          <button 
            onClick={() => setShowTemplateModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 模板列表 */}
          <div className="w-1/2 border-r border-border overflow-y-auto">
            <div className="p-4 space-y-3">
              <button
                onClick={loadDefaultTemplates}
                className="w-full flex items-center gap-2 px-4 py-3 bg-secondary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                加载默认模板
              </button>

              <button
                onClick={resetForm}
                className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                创建新模板
              </button>

              {templates.length === 0 ? (
                <EmptyState
                  type="folder"
                  className="py-8"
                  description="开始创作前，先创建一些模板吧"
                  action={{
                    label: '创建模板',
                    onClick: resetForm
                  }}
                />
              ) : (
                filteredTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className="border border-border rounded-lg p-4 hover:bg-bg-secondary transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${getCategoryColor(template.category)}`}>
                          {getCategoryLabel(template.category)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(template.content, index)}
                          className="p-1.5 hover:bg-bg-tertiary rounded"
                          title="复制"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="p-1.5 hover:bg-bg-tertiary rounded"
                          title="使用模板"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(index)}
                          className="p-1.5 hover:bg-bg-tertiary rounded"
                          title="编辑"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-1.5 hover:bg-danger/10 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-danger" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-text-muted line-clamp-2">
                      {template.content.slice(0, 100)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 编辑表单 */}
          <div className="w-1/2 overflow-y-auto p-6">
            <div className="max-w-xl mx-auto space-y-6">
              <h3 className="text-lg font-medium">
                {editingIndex !== null ? '编辑模板' : '创建新模板'}
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">
                  模板名称 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="为模板起一个描述性的名称"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">模板分类</label>
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
                  模板内容 <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="输入模板内容，支持Markdown格式..."
                  rows={20}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none font-mono text-sm"
                />
                <p className="text-xs text-text-muted mt-1">
                  字数：{formData.content.length}
                </p>
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
                  {editingIndex !== null ? '保存修改' : '创建模板'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
