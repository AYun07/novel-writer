import { useState } from 'react'
import { History, Clock, FileText, RotateCcw, Trash2, Download, Eye } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatDate, stripHtml } from '../lib/utils'

export default function VersionHistory() {
  const { versionHistory, chapters, setChapters, setShowToast } = useAppStore()
  const [selectedVersion, setSelectedVersion] = useState(null)

  const restoreVersion = (version) => {
    if (confirm('确定要恢复到这个版本吗？当前内容将被覆盖。')) {
      setChapters(version.chapters || [])
      setShowToast('已恢复到历史版本', 'success')
    }
  }

  const downloadVersion = (version) => {
    const content = JSON.stringify(version, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `version-${version.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowToast('版本已下载', 'success')
  }

  const deleteVersion = (id) => {
    if (confirm('确定要删除这个版本吗？')) {
      const updatedHistory = versionHistory.filter(v => v.id !== id)
      useAppStore.setState({ versionHistory: updatedHistory })
      setShowToast('版本已删除', 'info')
    }
  }

  const getPreview = (version) => {
    if (!version.chapters || version.chapters.length === 0) return '无内容'
    const firstChapter = version.chapters[0]
    const text = stripHtml(firstChapter.content || '')
    return text.slice(0, 200) + (text.length > 200 ? '...' : '')
  }

  const getWordCount = (version) => {
    if (!version.chapters) return 0
    return version.chapters.reduce((sum, ch) => {
      return sum + (stripHtml(ch.content || '').length)
    }, 0)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">版本历史</h2>
          <span className="text-sm text-text-muted">({versionHistory.length} 个版本)</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {versionHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <History className="w-16 h-16 text-text-muted mb-4" />
            <h3 className="text-lg font-semibold mb-2">还没有历史版本</h3>
            <p className="text-text-muted">
              自动保存会在您写作时定期创建版本记录
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {versionHistory.map((version) => (
              <div
                key={version.id}
                className="p-4 hover:bg-bg-tertiary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span className="font-medium">
                        {new Date(version.timestamp).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="text-sm text-text-muted mb-2">
                      {version.chapters?.length || 0} 章节 · {getWordCount(version).toLocaleString()} 字
                    </div>
                    <p className="text-sm text-text-muted line-clamp-2">
                      {getPreview(version)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedVersion(version)}
                      className="p-2 hover:bg-bg-secondary rounded transition-colors"
                      title="查看版本"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => restoreVersion(version)}
                      className="p-2 hover:bg-bg-secondary rounded transition-colors"
                      title="恢复此版本"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadVersion(version)}
                      className="p-2 hover:bg-bg-secondary rounded transition-colors"
                      title="下载版本"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteVersion(version.id)}
                      className="p-2 hover:bg-bg-secondary rounded transition-colors text-danger hover:text-danger"
                      title="删除版本"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedVersion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-bg-primary rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">版本详情</h3>
              <button
                onClick={() => setSelectedVersion(null)}
                className="p-2 hover:bg-bg-tertiary rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="mb-4 p-4 bg-bg-secondary rounded-lg">
                <div className="text-sm text-text-muted mb-2">
                  {new Date(selectedVersion.timestamp).toLocaleString('zh-CN')}
                </div>
                <div className="text-sm">
                  {selectedVersion.chapters?.length || 0} 章节 · {getWordCount(selectedVersion).toLocaleString()} 字
                </div>
              </div>
              
              {selectedVersion.chapters?.map((chapter, index) => (
                <div key={chapter.id} className="mb-4">
                  <h4 className="font-semibold mb-2">{index + 1}. {chapter.title}</h4>
                  <div className="p-4 bg-bg-secondary rounded-lg text-sm text-text-muted whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {stripHtml(chapter.content || '')}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => restoreVersion(selectedVersion)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
              >
                恢复此版本
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
