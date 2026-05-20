import { useState, useEffect } from 'react'
import { X, Plus, Edit3, Trash2, FolderOpen, Calendar, Save, MoreVertical, Check } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function ProjectSelector({ onClose }) {
  const { 
    activeProject,
    setActiveProject,
    projects,
    setProjects,
    setShowToast
  } = useAppStore()

  const [isCreating, setIsCreating] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: '',
    coverColor: '#3b82f6'
  })

  const createProject = () => {
    if (!formData.name.trim()) {
      setShowToast('请输入项目名称', 'warning')
      return
    }

    const newProject = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      genre: formData.genre,
      coverColor: formData.coverColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      chapters: [],
      characters: [],
      worldSettings: [],
      novelInfo: {},
      corpus: [],
      templates: []
    }

    setProjects([...projects, newProject])
    setIsCreating(false)
    setFormData({ name: '', description: '', genre: '', coverColor: '#3b82f6' })
    setShowToast('项目创建成功', 'success')
  }

  const deleteProject = (projectId) => {
    if (!confirm('确定要删除这个项目吗？所有内容都会丢失！')) {
      return
    }
    setProjects(projects.filter(p => p.id !== projectId))
    if (activeProject?.id === projectId) {
      setActiveProject(null)
    }
    setShowToast('项目已删除', 'info')
  }

  const openProject = (project) => {
    setActiveProject(project)
    setShowToast(`已打开项目: ${project.name}')
    onClose()
  }

  const startEdit = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      genre: project.genre || '',
      coverColor: project.coverColor || '#3b82f6'
    })
  }

  const saveEdit = () => {
    if (!editingProject) return
    
    const updatedProjects = projects.map(p => 
      p.id === editingProject.id 
        ? { ...p, ...formData, updatedAt: new Date().toISOString() }
        : p
    )
    setProjects(updatedProjects)
    setEditingProject(null)
    setShowToast('项目已更新', 'success')
  }

  const getProjectStats = (project) => {
    const chapterCount = project.chapters?.length || 0
    const wordCount = (project.chapters?.reduce((sum, ch) => {
      const tmp = document.createElement('div')
      tmp.innerHTML = ch.content || ''
      return sum + (tmp.textContent || tmp.innerText || '').length
    }, 0) || 0
    return { chapterCount, wordCount }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-5xl max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-text-primary">项目管理</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建项目
            </button>
            <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)]">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-bg-tertiary mb-4 flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">还没有项目</h3>
              <p className="text-text-muted mb-6 max-w-md">
                创建你的第一个项目，开始创作之旅吧！
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                创建第一个项目
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const { chapterCount, wordCount } = getProjectStats(project)
                const isActive = activeProject?.id === project.id

                return (
                  <div
                    key={project.id}
                    className={`p-4 rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => openProject(project)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: project.coverColor || '#3b82f6' }}
                      >
                        {project.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEdit(project)
                          }}
                          className="p-1.5 hover:bg-bg-tertiary rounded"
                        >
                          <Edit3 className="w-4 h-4 text-text-muted" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProject(project.id)
                          }}
                          className="p-1.5 hover:bg-bg-tertiary rounded text-danger hover:text-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-text-primary mb-1">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-text-muted mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    {project.genre && (
                      <span className="inline-block text-xs px-2 py-0.5 bg-bg-tertiary rounded-full mb-3">
                        {project.genre}
                      </span>
                    )}

                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(project.lastOpenedAt || project.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{chapterCount}章</span>
                        <span>{wordCount.toLocaleString()}字</span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-3 text-xs text-primary font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>当前打开</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 创建/编辑项目弹窗 */}
        {(isCreating || editingProject) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-bg-primary rounded-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingProject ? '编辑项目' : '创建新项目'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">项目名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入项目名称"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="简单描述一下这个项目"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">类型</label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      placeholder="小说类型"
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">主题色</label>
                    <input
                      type="color"
                      value={formData.coverColor}
                      onChange={(e) => setFormData({ ...formData, coverColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer border-0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setEditingProject(null)
                  }}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
                >
                  取消
                </button>
                <button
                  onClick={editingProject ? saveEdit : createProject}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                >
                  <Save className="w-4 h-4" />
                  {editingProject ? '保存' : '创建'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
