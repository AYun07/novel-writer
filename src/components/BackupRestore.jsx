import { useState } from 'react'
import { X, Save, RotateCcw, Clock, Trash2, Download, Upload, Check } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

export default function BackupRestore() {
  const { showBackupModal, setShowBackupModal, chapters, outline, characters, worldSettings, novelInfo, setShowToast } = useAppStore()
  const [backups, setBackups] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const createBackup = () => {
    setIsLoading(true)
    
    try {
      const backup = {
        id: Date.now().toString(),
        name: `备份 ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        data: {
          chapters,
          outline,
          characters,
          worldSettings,
          novelInfo
        },
        size: JSON.stringify({ chapters, outline, characters, worldSettings, novelInfo }).length
      }
      
      const savedBackups = JSON.parse(localStorage.getItem('integrated-author-backups') || '[]')
      savedBackups.unshift(backup)
      
      if (savedBackups.length > 10) {
        savedBackups.pop()
      }
      
      localStorage.setItem('integrated-author-backups', JSON.stringify(savedBackups))
      setBackups(savedBackups)
      setShowToast('备份创建成功！', 'success')
    } catch (error) {
      console.error('备份失败:', error)
      setShowToast('备份失败：' + error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const restoreBackup = (backupId) => {
    const savedBackups = JSON.parse(localStorage.getItem('integrated-author-backups') || '[]')
    const backup = savedBackups.find(b => b.id === backupId)
    
    if (!backup) {
      setShowToast('未找到备份', 'error')
      return
    }
    
    try {
      const { setChapters, setOutline, setCharacters, setWorldSettings, setNovelInfo } = useAppStore.getState()
      
      setChapters(backup.data.chapters || [])
      setOutline(backup.data.outline || '')
      setCharacters(backup.data.characters || [])
      setWorldSettings(backup.data.worldSettings || [])
      setNovelInfo(backup.data.novelInfo || {})
      
      setShowToast('恢复成功！', 'success')
      setShowBackupModal(false)
    } catch (error) {
      console.error('恢复失败:', error)
      setShowToast('恢复失败：' + error.message, 'error')
    }
  }

  const deleteBackup = (backupId) => {
    const savedBackups = JSON.parse(localStorage.getItem('integrated-author-backups') || '[]')
    const filtered = savedBackups.filter(b => b.id !== backupId)
    localStorage.setItem('integrated-author-backups', JSON.stringify(filtered))
    setBackups(filtered)
    setShowToast('备份已删除', 'info')
  }

  const exportBackup = (backup) => {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${backup.name.replace(/[<>:"/\\|?*]/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowToast('备份已导出', 'success')
  }

  const importBackup = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result)
        
        if (!backup.data || !backup.data.chapters) {
          throw new Error('无效的备份文件')
        }
        
        const savedBackups = JSON.parse(localStorage.getItem('integrated-author-backups') || '[]')
        
        backup.id = Date.now().toString()
        backup.name = `导入: ${backup.name || file.name}`
        
        savedBackups.unshift(backup)
        
        if (savedBackups.length > 10) {
          savedBackups.pop()
        }
        
        localStorage.setItem('integrated-author-backups', JSON.stringify(savedBackups))
        setBackups(savedBackups)
        setShowToast('备份导入成功！', 'success')
      } catch (error) {
        console.error('导入失败:', error)
        setShowToast('导入失败：' + error.message, 'error')
      }
    }
    reader.readAsText(file)
  }

  const clearAllBackups = () => {
    if (confirm('确定要删除所有备份吗？此操作不可恢复。')) {
      localStorage.removeItem('integrated-author-backups')
      setBackups([])
      setShowToast('所有备份已清除', 'info')
    }
  }

  if (!showBackupModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowBackupModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">备份与恢复</h2>
          <button 
            onClick={() => setShowBackupModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="space-y-6">
            {/* 创建备份 */}
            <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
              <div>
                <h3 className="font-medium">创建新备份</h3>
                <p className="text-sm text-text-muted mt-1">
                  保存当前所有章节、大纲、角色设定等信息
                </p>
              </div>
              <button
                onClick={createBackup}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors",
                  isLoading && "opacity-70"
                )}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                创建备份
              </button>
            </div>

            {/* 导入备份 */}
            <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
              <div>
                <h3 className="font-medium">导入备份</h3>
                <p className="text-sm text-text-muted mt-1">
                  从文件导入备份
                </p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                选择文件
                <input
                  type="file"
                  accept=".json"
                  onChange={importBackup}
                  className="hidden"
                />
              </label>
            </div>

            {/* 备份列表 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">备份列表</h3>
                {backups.length > 0 && (
                  <button
                    onClick={clearAllBackups}
                    className="text-sm text-danger hover:underline"
                  >
                    清除所有备份
                  </button>
                )}
              </div>

              {backups.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无备份记录</p>
                  <p className="text-sm mt-1">点击上方按钮创建第一个备份</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{backup.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(backup.createdAt).toLocaleString()}
                          </span>
                          <span>
                            {((backup.size || 0) / 1024).toFixed(1)} KB
                          </span>
                          <span>
                            {backup.data.chapters?.length || 0} 章节
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => restoreBackup(backup.id)}
                          className="p-2 hover:bg-bg-tertiary rounded-lg text-primary"
                          title="恢复"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportBackup(backup)}
                          className="p-2 hover:bg-bg-tertiary rounded-lg"
                          title="导出"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="p-2 hover:bg-bg-tertiary rounded-lg text-danger"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 提示信息 */}
            <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
              <p className="text-sm text-info">
                💡 提示：系统会自动保留最近10个备份。建议定期创建备份以防止数据丢失。
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-border bg-bg-secondary">
          <button 
            onClick={() => setShowBackupModal(false)}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
