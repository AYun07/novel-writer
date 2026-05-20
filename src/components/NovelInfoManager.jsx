import { useState } from 'react'
import { X, BookOpen, Save, Tag, FileText, Sparkles, Target } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function NovelInfoManager() {
  const { 
    showNovelInfoModal, 
    setShowNovelInfoModal,
    novelInfo,
    setNovelInfo,
    setShowToast
  } = useAppStore()

  const [formData, setFormData] = useState(novelInfo || {
    title: '',
    author: '',
    genre: '',
    style: '',
    targetAudience: '',
    description: '',
    themes: [],
    tags: [],
    wordCountGoal: 0,
    chapterCountGoal: 0,
    startDate: '',
    targetDate: '',
    notes: ''
  })

  const [newTheme, setNewTheme] = useState('')
  const [newTag, setNewTag] = useState('')

  const genreOptions = [
    '玄幻奇幻', '都市言情', '武侠仙侠', '科幻悬疑', 
    '历史军事', '游戏竞技', '轻小说', '同人创作',
    '短篇小说', '其他'
  ]

  const styleOptions = [
    '热血升级', '轻松搞笑', '黑暗压抑', '治愈温暖',
    '悬疑烧脑', '浪漫唯美', '快节奏', '慢热型',
    '意识流', '传统文学'
  ]

  const handleAddTheme = () => {
    if (newTheme.trim()) {
      setFormData({
        ...formData,
        themes: [...(formData.themes || []), newTheme.trim()]
      })
      setNewTheme('')
    }
  }

  const handleRemoveTheme = (index) => {
    setFormData({
      ...formData,
      themes: (formData.themes || []).filter((_, i) => i !== index)
    })
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      })
      setNewTag('')
    }
  }

  const handleRemoveTag = (index) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((_, i) => i !== index)
    })
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      setShowToast('请输入小说标题', 'warning')
      return
    }

    setNovelInfo(formData)
    setShowToast('小说信息已保存', 'success')
    setShowNovelInfoModal(false)
  }

  if (!showNovelInfoModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowNovelInfoModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">小说信息</h2>
          </div>
          <button 
            onClick={() => setShowNovelInfoModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* 基本信息 */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-text-muted flex items-center gap-2">
                <FileText className="w-4 h-4" />
                基本信息
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    小说标题 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="输入小说标题"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">作者名称</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="您的笔名/名字"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">小说类型</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">请选择</option>
                    {genreOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">文风类型</label>
                  <select
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">请选择</option>
                    {styleOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">目标读者</label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="例如：18-25岁男性"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">简介</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简要描述小说的核心内容、卖点、亮点..."
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </section>

            {/* 主题和标签 */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-text-muted flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                主题与标签
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">核心主题</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTheme())}
                    placeholder="输入主题后按回车添加"
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleAddTheme}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.themes || []).map((theme, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {theme}
                      <button
                        onClick={() => handleRemoveTheme(index)}
                        className="hover:text-danger"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">标签</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="输入标签后按回车添加"
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(index)}
                        className="hover:text-danger"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 写作目标 */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-text-muted flex items-center gap-2">
                <Target className="w-4 h-4" />
                写作目标
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">总字数目标</label>
                  <input
                    type="number"
                    value={formData.wordCountGoal}
                    onChange={(e) => setFormData({ ...formData, wordCountGoal: parseInt(e.target.value) || 0 })}
                    placeholder="例如：500000"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-text-muted mt-1">单位：字</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">总章节目标</label>
                  <input
                    type="number"
                    value={formData.chapterCountGoal}
                    onChange={(e) => setFormData({ ...formData, chapterCountGoal: parseInt(e.target.value) || 0 })}
                    placeholder="例如：300"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-text-muted mt-1">单位：章</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">开始日期</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">预计完成日期</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </section>

            {/* 备注 */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-text-muted">备注</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="其他备注信息、灵感来源、参考资料等..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
              />
            </section>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setShowNovelInfoModal(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Save className="w-4 h-4" />
                保存信息
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
