import { useState } from 'react'
import { X, User, Plus, Trash2, Edit3, Save, ChevronDown, ChevronRight, UserCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'
import dynamic from 'next/dynamic'

const EmptyState = dynamic(() => import('./EmptyState'), {
  ssr: false,
  loading: () => <div className="py-12"><div className="animate-pulse space-y-3"><div className="h-24 bg-bg-secondary rounded-lg"></div><div className="h-20 bg-bg-secondary rounded-lg"></div></div></div>
})

const AvatarPicker = dynamic(() => import('./AvatarPicker'), {
  ssr: false,
  loading: () => <div className="h-32 bg-bg-secondary rounded-lg animate-pulse"></div>
})

export default function CharacterManager() {
  const { 
    showCharacterModal, 
    setShowCharacterModal,
    characters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    setShowToast
  } = useAppStore()

  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: 'main',
    age: '',
    gender: '',
    avatar: '',
    appearance: '',
    personality: '',
    background: '',
    abilities: '',
    relationships: '',
    notes: ''
  })

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'main',
      age: '',
      gender: '',
      avatar: '',
      appearance: '',
      personality: '',
      background: '',
      abilities: '',
      relationships: '',
      notes: ''
    })
    setEditingId(null)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setShowToast('请输入角色名称', 'warning')
      return
    }

    if (editingId) {
      updateCharacter(editingId, formData)
      setShowToast('角色已更新', 'success')
    } else {
      addCharacter(formData)
      setShowToast('角色已添加', 'success')
    }

    resetForm()
  }

  const handleEdit = (character) => {
    setFormData({
      name: character.name || '',
      role: character.role || 'main',
      age: character.age || '',
      gender: character.gender || '',
      avatar: character.avatar || '',
      appearance: character.appearance || '',
      personality: character.personality || '',
      background: character.background || '',
      abilities: character.abilities || '',
      relationships: character.relationships || '',
      notes: character.notes || ''
    })
    setEditingId(character.id)
  }

  const handleDelete = (id) => {
    if (confirm('确定要删除这个角色吗？')) {
      deleteCharacter(id)
      setShowToast('角色已删除', 'info')
    }
  }

  const roleLabels = {
    main: '主角',
    secondary: '配角',
    supporting: '路人',
    antagonist: '反派'
  }

  const roleColors = {
    main: 'bg-primary/10 text-primary border-primary/30',
    secondary: 'bg-secondary/10 text-secondary border-secondary/30',
    supporting: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
    antagonist: 'bg-danger/10 text-danger border-danger/30'
  }

  if (!showCharacterModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowCharacterModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">角色设定管理</h2>
            <span className="text-sm text-text-muted">({characters.length} 个角色)</span>
          </div>
          <button 
            onClick={() => setShowCharacterModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 角色列表 */}
          <div className="w-80 border-r border-border overflow-y-auto">
            <div className="p-4 space-y-2">
              <button
                onClick={resetForm}
                className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加新角色
              </button>

              {characters.length === 0 ? (
                <EmptyState
                  type="characters"
                  className="py-8"
                  action={{
                    label: '添加角色',
                    onClick: resetForm
                  }}
                />
              ) : (
                characters.map((character) => (
                  <div
                    key={character.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-2 p-3 cursor-pointer hover:bg-bg-secondary transition-colors"
                      onClick={() => setExpandedId(expandedId === character.id ? null : character.id)}
                    >
                      <button className="p-1">
                        {expandedId === character.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{character.name}</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded border",
                            roleColors[character.role] || roleColors.secondary
                          )}>
                            {roleLabels[character.role] || '配角'}
                          </span>
                        </div>
                        {character.age && (
                          <p className="text-xs text-text-muted mt-1">
                            {character.gender || ''} {character.age}岁
                          </p>
                        )}
                      </div>
                    </div>

                    {expandedId === character.id && (
                      <div className="border-t border-border p-3 bg-bg-secondary space-y-2">
                        {character.personality && (
                          <div className="text-sm">
                            <span className="text-text-muted">性格：</span>
                            <span className="ml-2">{character.personality.slice(0, 50)}{character.personality.length > 50 ? '...' : ''}</span>
                          </div>
                        )}
                        {character.background && (
                          <div className="text-sm">
                            <span className="text-text-muted">背景：</span>
                            <span className="ml-2">{character.background.slice(0, 50)}{character.background.length > 50 ? '...' : ''}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleEdit(character)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-hover transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(character.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-danger border border-danger rounded hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 角色编辑表单 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    角色名称 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入角色名称"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">角色定位</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="main">主角</option>
                    <option value="secondary">配角</option>
                    <option value="supporting">路人</option>
                    <option value="antagonist">反派</option>
                  </select>
                </div>
              </div>

              <AvatarPicker
                value={formData.avatar}
                onChange={(avatar) => setFormData({ ...formData, avatar })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">年龄</label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="例：25岁"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">性别</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">外貌特征</label>
                <textarea
                  value={formData.appearance}
                  onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                  placeholder="描述角色的外貌特征：身高、体型、发色、眼睛、穿着等"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">性格特点</label>
                <textarea
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  placeholder="描述角色的性格：内向/外向、优点、缺点、习惯等"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">人物背景</label>
                <textarea
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  placeholder="描述角色的背景故事：出身、经历、动机等"
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">特殊能力</label>
                <textarea
                  value={formData.abilities}
                  onChange={(e) => setFormData({ ...formData, abilities: e.target.value })}
                  placeholder="描述角色的特殊能力或技能（可选）"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">人物关系</label>
                <textarea
                  value={formData.relationships}
                  onChange={(e) => setFormData({ ...formData, relationships: e.target.value })}
                  placeholder="描述与其他角色的关系"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="其他备注信息（可选）"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                />
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
                  {editingId ? '保存修改' : '添加角色'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
