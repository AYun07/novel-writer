import { useState } from 'react'
import { X, FileText, FileSpreadsheet, Download, Check, FileJson, FileCode, BookOpen, File } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

export default function ExportModal() {
  const { showExportModal, setShowExportModal, chapters, novelInfo, setShowToast } = useAppStore()
  const [exportFormat, setExportFormat] = useState('txt')
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    includeTitle: true,
    includeAuthor: true,
    includeDescription: true,
    includeChapterNumbers: true,
    includeOutline: false,
    includeCharacters: false,
    includeWorldSettings: false,
    singleFile: true,
    chapterSeparator: '\n\n---章节分隔---\n\n'
  })

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const exportAsTxt = () => {
    let content = ''
    if (exportOptions.includeTitle && novelInfo.title) {
      content += `# ${novelInfo.title}\n\n`
    }
    if (exportOptions.includeAuthor && novelInfo.author) {
      content += `作者: ${novelInfo.author}\n\n`
    }
    if (exportOptions.includeDescription && novelInfo.description) {
      content += `${novelInfo.description}\n\n`
    }

    chapters.forEach((chapter, index) => {
      if (exportOptions.includeChapterNumbers) {
        content += `## 第${index + 1}章 ${chapter.title || '未命名'}\n\n`
      } else {
        content += `## ${chapter.title || '未命名章节'}\n\n`
      }
      const chapterText = stripHtml(chapter.content || '')
      content += chapterText + '\n\n'
    })

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    return blob
  }

  const exportAsHtml = () => {
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
    .info { text-align: center; color: #666; margin-bottom: 2em; }
  </style>
</head>
<body>
  <h1>${novelInfo.title || '未命名小说'}</h1>
`
    if (novelInfo.author) {
      html += `  <div class="info">作者: ${novelInfo.author}</div>`
    }
    if (novelInfo.description) {
      html += `  <div class="info">${novelInfo.description}</div>`
    }
    html += '\n'

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
    return blob
  }

  const exportAsMarkdown = () => {
    let md = `# ${novelInfo.title || '未命名小说'}\n\n`

    if (novelInfo.author) {
      md += `**作者**: ${novelInfo.author}\n\n`
    }
    if (novelInfo.description) {
      md += `**简介**: ${novelInfo.description}\n\n`
    }

    chapters.forEach((chapter, index) => {
      md += `## ${exportOptions.includeChapterNumbers ? `第${index + 1}章 ` : ''}${chapter.title || '未命名'}\n\n`
      const mdContent = stripHtml(chapter.content || '')
      md += mdContent + '\n\n'
      if (index < chapters.length - 1) {
        md += '---\n\n'
      }
    })

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    return blob
  }

  const exportAsJson = () => {
    const exportData = {
      title: novelInfo.title || '未命名小说',
      info: novelInfo,
      chapters: chapters.map((ch, index) => ({
        number: index + 1,
        title: ch.title || '未命名',
        content: ch.content || '',
        plainText: stripHtml(ch.content || '')
      })),
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    return blob
  }

  const exportAsDocx = () => {
    const content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:sz w:val="36"/>
        <w:b/>
      </w:pPr>
      <w:r>
        <w:t>${novelInfo.title || '未命名小说'}</w:t>
      </w:r>
    </w:p>
    ${novelInfo.author ? `
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:t>作者: ${novelInfo.author}</w:t>
      </w:r>
    </w:p>` : ''}
    ${chapters.map((chapter, index) => `
    <w:p>
      <w:pPr>
        <w:jc w:val="left"/>
        <w:sz w:val="28"/>
        <w:b/>
      </w:pPr>
      <w:r>
        <w:t>${exportOptions.includeChapterNumbers ? `第${index + 1}章 ` : ''}${chapter.title || '未命名'}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>${stripHtml(chapter.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t>
      </w:r>
    </w:p>`).join('')}
  </w:body>
</w:document>`

    const blob = new Blob([content], { type: 'application/msword' })
    return blob
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      let blob
      let extension

      switch (exportFormat) {
        case 'txt':
          blob = exportAsTxt()
          extension = 'txt'
          break
        case 'html':
          blob = exportAsHtml()
          extension = 'html'
          break
        case 'markdown':
          blob = exportAsMarkdown()
          extension = 'md'
          break
        case 'json':
          blob = exportAsJson()
          extension = 'json'
          break
        case 'docx':
          blob = exportAsDocx()
          extension = 'doc'
          break
        default:
          blob = exportAsTxt()
          extension = 'txt'
      }

      const filename = `${novelInfo.title || '小说'}.${extension}`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setShowToast('导出成功！', 'success')
      setShowExportModal(false)
    } catch (error) {
      console.error('导出失败:', error)
      setShowToast('导出失败: ' + error.message, 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions = [
    { value: 'txt', label: 'TXT 纯文本', icon: FileText, description: '通用文本格式，可用任何编辑器打开', color: 'blue' },
    { value: 'markdown', label: 'Markdown', icon: FileCode, description: '轻量级标记格式，支持排版', color: 'purple' },
    { value: 'html', label: 'HTML 网页', icon: FileSpreadsheet, description: '网页格式，可直接在浏览器查看', color: 'orange' },
    { value: 'docx', label: 'Word 文档', icon: File, description: 'Microsoft Word 格式', color: 'indigo' },
    { value: 'json', label: 'JSON 数据', icon: FileJson, description: '包含所有元数据的结构化数据', color: 'green' }
  ]

  if (!showExportModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            导出小说
          </h2>
          <button 
            onClick={() => setShowExportModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">选择导出格式</label>
              <div className="grid grid-cols-2 gap-3">
                {formatOptions.map(format => (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left",
                      exportFormat === format.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-bg-secondary"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <format.icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{format.label}</span>
                    </div>
                    <p className="text-xs text-text-muted">{format.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">导出选项</label>
              <div className="space-y-2">
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
                    checked={exportOptions.includeAuthor}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeAuthor: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">包含作者信息</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeDescription}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeDescription: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">包含小说简介</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeChapterNumbers}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeChapterNumbers: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">包含章节序号</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-bg-secondary rounded-lg border border-border">
              <div className="text-sm text-text-primary">
                <p className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  导出预览
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg-primary p-3 rounded">
                    <p className="text-xs text-text-muted mb-1">小说标题</p>
                    <p className="font-medium">{novelInfo.title || '未命名'}</p>
                  </div>
                  <div className="bg-bg-primary p-3 rounded">
                    <p className="text-xs text-text-muted mb-1">章节数量</p>
                    <p className="font-medium">{chapters.length} 章</p>
                  </div>
                  <div className="bg-bg-primary p-3 rounded">
                    <p className="text-xs text-text-muted mb-1">导出格式</p>
                    <p className="font-medium">{formatOptions.find(f => f.value === exportFormat)?.label}</p>
                  </div>
                  <div className="bg-bg-primary p-3 rounded">
                    <p className="text-xs text-text-muted mb-1">预估字数</p>
                    <p className="font-medium">
                      {chapters.reduce((sum, ch) => sum + ((ch.content || '').replace(/<[^>]*>/g, '').length), 0).toLocaleString()} 字
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-border bg-bg-secondary">
          <button 
            onClick={() => setShowExportModal(false)}
            className="px-6 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || chapters.length === 0}
            className={cn(
              "flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50",
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
