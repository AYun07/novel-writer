import { useState } from 'react'
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Wand2, 
  Search, 
  FileText, 
  MessageSquare,
  Loader2,
  X,
  Zap
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { 
  generateOutline, 
  generateChapterContentStream, 
  polishText, 
  generateSummary,
  getWritingAdvice,
  chatWithAI
} from '../services/aiService'
import { cn } from '../lib/utils'

export default function AISidebar() {
  const { 
    aiSidebarOpen, 
    setAiSidebarOpen,
    chapters,
    activeChapterId,
    updateChapter,
    outline,
    setOutline,
    isGeneratingOutline,
    setIsGeneratingOutline,
    keywords,
    setKeywords,
    apiConfig,
    setShowToast,
    generatedContent,
    setGeneratedContent,
    characters,
    worldSettings,
    novelInfo,
    chatStreaming,
    setChatStreaming
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('outline')
  const [isGenerating, setIsGenerating] = useState(false)
  const [polishType, setPolishType] = useState('grammar')
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  const activeChapter = chapters.find(ch => ch.id === activeChapterId)

  const handleGenerateOutline = async () => {
    if (!keywords.trim()) {
      setShowToast('请输入小说主题关键词', 'warning')
      return
    }
    if (!apiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    setIsGeneratingOutline(true)
    try {
      const result = await generateOutline(keywords, '', null, apiConfig)
      setOutline(result)
      setShowToast('大纲生成成功！', 'success')
    } catch (error) {
      setShowToast('大纲生成失败：' + error.message, 'error')
    } finally {
      setIsGeneratingOutline(false)
    }
  }

  const handleGenerateChapter = async () => {
    if (!activeChapter || !outline) {
      setShowToast('请先选择章节并生成大纲', 'warning')
      return
    }
    if (!apiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    setIsGenerating(true)
    setGeneratedContent('')
    
    const previousContent = chapters
      .filter((_, index) => chapters.indexOf(activeChapter) > index)
      .map(ch => ch.content)
      .join('\n\n')

    try {
      await generateChapterContentStream(
        activeChapter.title,
        outline,
        previousContent,
        null,
        characters,
        worldSettings,
        novelInfo,
        apiConfig,
        (chunk, full) => {
          setGeneratedContent(full)
        }
      )
      setShowToast('章节内容生成成功！', 'success')
    } catch (error) {
      setShowToast('章节生成失败：' + error.message, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInsertContent = () => {
    if (!generatedContent || !activeChapterId) return
    
    const currentContent = activeChapter?.content || ''
    const newContent = currentContent + '<p>' + generatedContent + '</p>'
    updateChapter(activeChapterId, { content: newContent })
    setGeneratedContent('')
    setShowToast('内容已插入编辑器', 'success')
  }

  const handlePolish = async () => {
    if (!activeChapter?.content) {
      setShowToast('请先选择章节并输入内容', 'warning')
      return
    }
    if (!apiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    setIsGenerating(true)
    try {
      const result = await polishText(activeChapter.content, polishType, '', apiConfig)
      updateChapter(activeChapterId, { content: '<p>' + result + '</p>' })
      setShowToast('润色完成！', 'success')
    } catch (error) {
      setShowToast('润色失败：' + error.message, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSummarize = async () => {
    if (!activeChapter?.content) {
      setShowToast('请先选择章节并输入内容', 'warning')
      return
    }
    if (!apiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateSummary(activeChapter.content, { length: 'medium', format: 'paragraph' }, apiConfig)
      setShowToast('摘要已生成：\n' + result, 'info')
    } catch (error) {
      setShowToast('摘要生成失败：' + error.message, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGetAdvice = async () => {
    if (!activeChapter?.content) {
      setShowToast('请先选择章节并输入内容', 'warning')
      return
    }
    if (!apiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    setIsGenerating(true)
    try {
      const result = await getWritingAdvice(activeChapter.content, apiConfig)
      setShowToast('写作建议已生成：\n' + result, 'info')
    } catch (error) {
      setShowToast('获取建议失败：' + error.message, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChat = async () => {
    if (!chatMessage.trim()) return
    if (!apiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    const newHistory = [...chatHistory, { isUser: true, content: chatMessage }]
    setChatHistory(newHistory)
    setChatMessage('')
    setChatStreaming(true)

    try {
      let fullResponse = ''
      await chatWithAI(chatMessage, chatHistory, apiConfig, null, [], (chunk, full) => {
        fullResponse = full
        const updatedHistory = [...newHistory, { isUser: false, content: fullResponse }]
        setChatHistory(updatedHistory)
      })
    } catch (error) {
      setShowToast('对话失败：' + error.message, 'error')
    } finally {
      setChatStreaming(false)
    }
  }

  const polishOptions = [
    { value: 'grammar', label: '语法润色' },
    { value: 'style', label: '文风优化' },
    { value: 'emotion', label: '情感增强' },
    { value: 'logic', label: '逻辑梳理' },
    { value: 'concise', label: '精简提炼' },
    { value: 'expand', label: '扩写丰富' }
  ]

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 z-40 transition-opacity duration-300",
          aiSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setAiSidebarOpen(false)}
      />

      <div className={cn(
        "fixed right-0 top-0 h-full bg-bg-sidebar text-text-sidebar z-50 transition-transform duration-300 flex flex-col",
        aiSidebarOpen ? "translate-x-0" : "translate-x-full",
        "w-80"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">AI 助手</span>
          </div>
          <button 
            onClick={() => setAiSidebarOpen(false)}
            className="p-2 hover:bg-bg-sidebar-hover rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-border-dark">
          {[
            { id: 'outline', label: '大纲', icon: BookOpen },
            { id: 'generate', label: '续写', icon: Wand2 },
            { id: 'polish', label: '润色', icon: Zap },
            { id: 'chat', label: '对话', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-sm transition-colors",
                activeTab === tab.id 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-text-muted hover:text-text-sidebar"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'outline' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">小说主题/关键词</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="例如：科幻、都市、修仙..."
                  className="w-full px-3 py-2 bg-bg-sidebar-hover border border-border-dark rounded-lg text-text-sidebar placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>
              
              <button
                onClick={handleGenerateOutline}
                disabled={isGeneratingOutline}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors",
                  isGeneratingOutline && "opacity-70"
                )}
              >
                {isGeneratingOutline ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    生成大纲
                  </>
                )}
              </button>

              {outline && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">大纲内容</label>
                    <button 
                      onClick={() => setOutline('')}
                      className="text-xs text-text-muted hover:text-danger"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-3 bg-bg-sidebar-hover border border-border-dark rounded-lg text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {outline}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div className="p-3 bg-bg-sidebar-hover border border-border-dark rounded-lg">
                <p className="text-sm text-text-muted">
                  当前章节：<span className="text-text-sidebar">{activeChapter?.title || '未选择'}</span>
                </p>
              </div>

              {!outline && (
                <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning">
                  提示：请先在「大纲」标签页生成大纲
                </div>
              )}

              <button
                onClick={handleGenerateChapter}
                disabled={isGenerating || !outline}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors",
                  (isGenerating || !outline) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    生成章节内容
                  </>
                )}
              </button>

              {generatedContent && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">生成内容</label>
                    <button 
                      onClick={() => setGeneratedContent('')}
                      className="text-xs text-text-muted hover:text-danger"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-3 bg-bg-sidebar-hover border border-border-dark rounded-lg text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {generatedContent}
                  </div>
                  <button
                    onClick={handleInsertContent}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    插入到编辑器
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'polish' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">润色类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {polishOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPolishType(option.value)}
                      className={cn(
                        "px-3 py-2 text-sm rounded-lg border transition-colors",
                        polishType === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border-dark bg-bg-sidebar-hover text-text-muted hover:text-text-sidebar"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePolish}
                disabled={isGenerating || !activeChapter?.content}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors",
                  (isGenerating || !activeChapter?.content) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    润色中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    一键润色
                  </>
                )}
              </button>

              <button
                onClick={handleSummarize}
                disabled={isGenerating || !activeChapter?.content}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2 bg-bg-sidebar-hover border border-border-dark rounded-lg hover:bg-bg-tertiary transition-colors text-text-sidebar",
                  (isGenerating || !activeChapter?.content) && "opacity-50 cursor-not-allowed"
                )}
              >
                <FileText className="w-4 h-4" />
                生成摘要
              </button>

              <button
                onClick={handleGetAdvice}
                disabled={isGenerating || !activeChapter?.content}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2 bg-bg-sidebar-hover border border-border-dark rounded-lg hover:bg-bg-tertiary transition-colors text-text-sidebar",
                  (isGenerating || !activeChapter?.content) && "opacity-50 cursor-not-allowed"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                获取写作建议
              </button>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-3">
                {chatHistory.map((msg, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-3 rounded-lg",
                      msg.isUser ? "bg-primary/20 text-text-sidebar" : "bg-bg-sidebar-hover text-text-sidebar"
                    )}
                  >
                    <p className="text-xs text-text-muted mb-1">
                      {msg.isUser ? '我' : 'AI'}
                    </p>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
                {chatStreaming && (
                  <div className="p-3 bg-bg-sidebar-hover rounded-lg">
                    <p className="text-xs text-text-muted mb-1">AI</p>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="输入问题..."
                  className="w-full px-3 py-2 bg-bg-sidebar-hover border border-border-dark rounded-lg text-text-sidebar placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleChat}
                  disabled={!chatMessage.trim() || chatStreaming}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors",
                    (!chatMessage.trim() || chatStreaming) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {chatStreaming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      思考中...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      发送
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={() => setAiSidebarOpen(true)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-bg-sidebar border-l border-border-dark rounded-l-lg hover:bg-bg-sidebar-hover transition-all",
          aiSidebarOpen && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft className="w-5 h-5 text-text-sidebar" />
      </button>
    </>
  )
}