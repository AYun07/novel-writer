import { useState } from 'react'
import { FileText, Plus, Edit3, Trash2, Save, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function SceneCards() {
  const { chapters, activeChapterId, updateChapter, setShowToast } = useAppStore()
  const [isAddingScene, setIsAddingScene] = useState(false)
  const [editingScene, setEditingScene] = useState(null)
  const [newScene, setNewScene] = useState({
    title: '',
    description: '',
    location: '',
    time: '',
    characters: [],
    notes: ''
  })

  const activeChapter = chapters.find(ch => ch.id === activeChapterId)
  const scenes = activeChapter?.scenes || []

  const addScene = () => {
    if (!newScene.title.trim()) {
      setShowToast('请输入场景标题', 'warning')
      return
    }

    const scene = {
      id: Date.now().toString(),
      ...newScene,
      createdAt: new Date().toISOString()
    }

    updateChapter(activeChapterId, {
      scenes: [...scenes, scene]
    })

    setIsAddingScene(false)
    setNewScene({ title: '', description: '', location: '', time: '', characters: [], notes: '' })
    setShowToast('场景已添加', 'success')
  }

  const updateScene = (sceneId, updates) => {
    const updatedScenes = scenes.map(sc =>
      sc.id === sceneId ? { ...sc, ...updates } : sc
    )
    updateChapter(activeChapterId, { scenes: updatedScenes })
  }

  const deleteScene = (sceneId) => {
    if (confirm('确定要删除这个场景吗？')) {
      updateChapter(activeChapterId, {
        scenes: scenes.filter(sc => sc.id !== sceneId)
      })
      setShowToast('场景已删除', 'info')
    }
  }

  const saveEditedScene = () => {
    if (!editingScene) return
    updateScene(editingScene.id, editingScene)
    setEditingScene(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">场景卡</h3>
          <span className="text-sm text-text-muted">({scenes.length} 个场景)</span>
        </div>
        <button
          onClick={() => setIsAddingScene(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          新建场景
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {scenes.length === 0 && !isAddingScene ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <h4 className="font-medium mb-1">暂无场景</h4>
            <p className="text-sm mb-4">添加场景卡来规划你的章节</p>
            <button
              onClick={() => setIsAddingScene(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
            >
              添加第一个场景
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isAddingScene && (
              <div className="bg-bg-secondary rounded-lg p-4 border border-primary border-dashed">
                <h4 className="font-medium mb-3 text-primary">新建场景</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-text-secondary block mb-1">场景标题</label>
                    <input
                      type="text"
                      value={newScene.title}
                      onChange={(e) => setNewScene({ ...newScene, title: e.target.value })}
                      placeholder="输入场景标题"
                      className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary block mb-1">场景描述</label>
                    <textarea
                      value={newScene.description}
                      onChange={(e) => setNewScene({ ...newScene, description: e.target.value })}
                      placeholder="描述这个场景"
                      rows={3}
                      className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg resize-none focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-text-secondary block mb-1">地点</label>
                      <input
                        type="text"
                        value={newScene.location}
                        onChange={(e) => setNewScene({ ...newScene, location: e.target.value })}
                        placeholder="场景地点"
                        className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-text-secondary block mb-1">时间</label>
                      <input
                        type="text"
                        value={newScene.time}
                        onChange={(e) => setNewScene({ ...newScene, time: e.target.value })}
                        placeholder="时间"
                        className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={addScene}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                    >
                      添加
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingScene(false)
                        setNewScene({ title: '', description: '', location: '', time: '', characters: [], notes: '' })
                      }}
                      className="px-4 py-2 text-text-secondary hover:text-text-primary"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {scenes.map((scene, index) => (
              <div key={scene.id} className="bg-bg-secondary rounded-lg p-4 border border-border hover:border-primary/30">
                {editingScene?.id === scene.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingScene.title}
                      onChange={(e) => setEditingScene({ ...editingScene, title: e.target.value })}
                      className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-primary font-medium"
                    />
                    <textarea
                      value={editingScene.description}
                      onChange={(e) => setEditingScene({ ...editingScene, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg resize-none focus:outline-none focus:border-primary"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editingScene.location}
                        onChange={(e) => setEditingScene({ ...editingScene, location: e.target.value })}
                        placeholder="地点"
                        className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        value={editingScene.time}
                        onChange={(e) => setEditingScene({ ...editingScene, time: e.target.value })}
                        placeholder="时间"
                        className="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={saveEditedScene}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-sm rounded hover:bg-primary-hover"
                      >
                        <Save className="w-3.5 h-3.5" />
                        保存
                      </button>
                      <button
                        onClick={() => setEditingScene(null)}
                        className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded font-medium">
                          #{index + 1}
                        </span>
                        <h4 className="font-medium text-text-primary">{scene.title}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingScene(scene)}
                          className="p-1 hover:bg-bg-primary rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-text-muted" />
                        </button>
                        <button
                          onClick={() => deleteScene(scene.id)}
                          className="p-1 hover:bg-bg-primary rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-danger" />
                        </button>
                      </div>
                    </div>

                    {scene.description && (
                      <p className="text-sm text-text-secondary mb-3 line-clamp-3">{scene.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      {scene.location && (
                        <span className="text-xs flex items-center gap-1 px-2 py-1 bg-bg-primary rounded text-text-muted">
                          <MapPin className="w-3 h-3" />
                          {scene.location}
                        </span>
                      )}
                      {scene.time && (
                        <span className="text-xs flex items-center gap-1 px-2 py-1 bg-bg-primary rounded text-text-muted">
                          <Clock className="w-3 h-3" />
                          {scene.time}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-text-muted">
                      {new Date(scene.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
