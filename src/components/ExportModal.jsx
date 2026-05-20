import { useState } from 'react'
import { X, FileText, FileSpreadsheet, Download, Check } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

export default function ExportModal() {
  const { showExportModal, setShowExportModal, chapters, novelInfo, setShowToast } = useAppStore()
  const [exportFormat, setExportFormat] = useState('txt')
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    includeTitle: true,
    includeChapterNumbers: true,
    includeOutline: false,
    singleFile: true,
    chapterSeparator: '\n\n---章节分隔---\n\n'
  })

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      let content = ''
      const allContent = chapters.map(ch => ch.content || '').join('\n\n')
      const plainText = allContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      
      if (exportFormat === 'txt') {
        if (exportOptions.includeTitle && novelInfo.title) {
          content += `# ${novelInfo.title}\n\n`
        }
        if (exportOptions.includeOutline && useAppStore.getState().outline) {
          content += `## 大纲\n\n${useAppStore.getState().outline}\n\n`
        }
        
        chapters.forEach((chapter, index) => {
          if (exportOptions.includeChapterNumbers) {
            content += `### 第${index + 1}章 ${chapter.title || '未命名'}\n\n`
          } else {
            content += `### ${chapter.title || '未命名章节'}\n\n`
          }
          const chapterText = (chapter.content || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          content += chapterText + '\n\n'
          if (index < chapters.length - 1 && exportOptions.singleFile) {
            content += exportOptions.chapterSeparator + '\n'
          }
        })
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        downloadBlob(blob, `${novelInfo.title || '小说'}.txt`)
        setShowToast('导出成功！', 'success')
      } else if (exportFormat === 'json') {
        const exportData = {
          title: novelInfo.title || '未命名小说',
          info: novelInfo,
          outline: useAppStore.getState().outline,
          chapters: chapters.map((ch, index) => ({
            number: index + 1,
            title: ch.title || '未命名',
            content: ch.content || ''
          })),
          exportedAt: new Date().toISOString()
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        downloadBlob(blob, `${novelInfo.title || '小说'}.json`)
        setShowToast('导出成功！', 'success')
      } else if (exportFormat === 'html') {
        let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${novelInfo.title || '小说'}</title>
  <style>
    body { font-family: "Microsoft YaHei", "SimSun", serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; }
    h1 { text-align: center; margin-bottom: 2em; }
    h2 { margin-top: 2em; border-bottom: 1px solid #ddd; padding-bottom: 0.5em; }
    p { text-indent: 2em; margin: 1em 0; }
    .chapter-separator { text-align: center; margin: 3em 0; color: #999; }
    blockquote { border-left: 3px solid #ddd; padding-left: 1em; color: #666; margin: 1em 0; font-style: italic; }
  </style>
</head>
<body>
  <h1>${novelInfo.title || '未命名小说'}</h1>
`
        
        if (novelInfo.author) {
          html += `  <p style="text-align:center;color:#666;">作者：${novelInfo.author}</p>\n`
        }
        if (novelInfo.description) {
          html += `  <p style="text-align:center;color:#666;">简介：${novelInfo.description}</p>\n`
        }
        
        chapters.forEach((chapter, index) => {
          if (index > 0) {
            html += `  <div class="chapter-separator">* * *</div>\n`
          }
          html += `  <h2>${exportOptions.includeChapterNumbers ? `第${index + 1}章 ` : ''}${chapter.title || '未命名'}</h2>\n`
          html += `  <div>${chapter.content || ''}</div>\n`
        })
        
        html += `</body>
</html>`
        
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
        downloadBlob(blob, `${novelInfo.title || '小说'}.html`)
        setShowToast('导出成功！', 'success')
      } else if (exportFormat === 'markdown') {
        let md = `# ${novelInfo.title || '未命名小说'}\n\n`
        
        if (novelInfo.author) {
          md += `**作者**：${novelInfo.author}\n\n`
        }
        if (novelInfo.description) {
          md += `**简介**：${novelInfo.description}\n\n`
        }
        
        if (exportOptions.includeOutline && useAppStore.getState().outline) {
          md += `## 大纲\n\n${useAppStore.getState().outline}\n\n---\n\n`
        }
        
        chapters.forEach((chapter, index) => {
          md += `## ${exportOptions.includeChapterNumbers ? `第${index + 1}章 ` : ''}${chapter.title || '未命名'}\n\n`
          const mdContent = (chapter.content || '')
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
          md += mdContent + '\n\n'
          if (index < chapters.length - 1) {
            md += '---\n\n'
          }
        })
        
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
        downloadBlob(blob, `${novelInfo.title || '小说'}.md`)
        setShowToast('导出成功！', 'success')
      }
      
      setShowExportModal(false)
    } catch (error) {
      console.error('导出失败:', error)
      setShowToast('导出失败：' + error.message, 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatOptions = [
    { value: 'txt', label: '纯文本', icon: FileText, description: '通用文本格式，可用任何编辑器打开' },
    { value: 'markdown', label: 'Markdown', icon: FileText, description: '支持格式的轻量级标记语言' },
    { value: 'html', label: 'HTML', icon: FileSpreadsheet, description: '网页格式，可直接在浏览器中查看' },
    { value: 'json', label: 'JSON', icon: FileSpreadsheet, description: '包含所有章节元数据的结构化数据' }
  ]

  if (!showExportModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">导出小说</h2>
          <button 
            onClick={() => setShowExportModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">选择导出格式</label>
              <div className="grid grid-cols-2 gap-3">
                {formatOptions.map(format => (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left",
                      exportFormat === format.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <format.icon className={cn(
                      "w-6 h-6 mb-2",
                      exportFormat === format.value ? "text-primary" : "text-text-muted"
                    )} />
                    <h3 className="font-medium">{format.label}</h3>
                    <p className="text-xs text-text-muted mt-1">{format.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">导出选项</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTitle}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeTitle: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">包含小说标题</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeChapterNumbers}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeChapterNumbers: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">包含章节编号</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeOutline}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeOutline: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">包含大纲</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-bg-secondary rounded-lg">
              <div className="text-sm text-text-muted">
                <p className="mb-2">导出预览：</p>
                <p>• 小说标题：{novelInfo.title || '未命名'}</p>
                <p>• 章节数量：{chapters.length} 章</p>
                <p>• 导出格式：{formatOptions.find(f => f.value === exportFormat)?.label}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-border bg-bg-secondary">
          <button 
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || chapters.length === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg transition-colors",
              (isExporting || chapters.length === 0) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                导出
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}