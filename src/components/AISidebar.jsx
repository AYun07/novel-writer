import { useState, useEffect, useRef } from 'react'
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
  Zap,
  Trash2,
  Download,
  Copy,
  Send,
  AlertCircle,
  CheckCircle,
  Clock
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
import { cn, copyToClipboard, downloadFile, formatRelativeTime, generateId } from '../lib/utils'

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
    aiConfig,
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
  const [sessionId, setSessionId] = useState(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    loadChatSessions()
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory, chatStreaming])

  const loadChatSessions = () => {
    const sessions = JSON.parse(localStorage.getItem('ai-chat-sessions') || '[]')
    if (sessions.length > 0) {
      const lastSession = sessions[0]
      setChatHistory(lastSession.messages || [])
      setSessionId(lastSession.id)
    }
  }

  const saveChatSession = (messages) => {
    const sessions = JSON.parse(localStorage.getItem('ai-chat-sessions') || '[]')
    
    const sessionData = {
      id: sessionId || generateId('session-'),
      messages,
      updatedAt: new Date().toISOString(),
      title: messages.length > 0 ? messages[0].content.substring(0, 30) + '...' : '新对话'
    }

    const existingIndex = sessions.findIndex(s => s.id === sessionId)
    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData
    } else {
      sessions.unshift(sessionData)
    }

    if (sessions.length > 20) {
      sessions.pop()
    }

    localStorage.setItem('ai-chat-sessions', JSON.stringify(sessions))
    setSessionId(sessionData.id)
  }

  const clearChatHistory = () => {
    if (!confirm('确定要清空当前对话历史吗？')) return
    
    const messages = [...chatHistory]
    saveChatSession([])
    setChatHistory([])
    setShowToast('对话历史已清空', 'info')
  }

  const exportChatHistory = () => {
    if (chatHistory.length === 0) {
      setShowToast('没有对话历史可以导出', 'warning')
      return
    }

    const content = chatHistory.map(msg => {
      const role = msg.isUser ? '【我】' : '【AI】'
      const time = msg.timestamp ? formatRelativeTime(msg.timestamp) : ''
      return `${role} ${time}\n${msg.content}\n`
    }).join('\n---\n\n')

    downloadFile(content, `对话历史_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain')
    setShowToast('对话历史已导出', 'success')
  }

  const handleGenerateOutline = async () => {
    if (!keywords.trim()) {
      setShowToast('请输入小说主题关键词', 'warning')
      return
    }
    if (!aiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    setIsGeneratingOutline(true)
    try {
      const result = await generateOutline(keywords, '', null, aiConfig)
      setOutline(result)
      saveGeneratedOutline(result)
      setShowToast('大纲生成成功！', 'success')
    } catch (error) {
      setShowToast('大纲生成失败：' + error.message, 'error')
    } finally {
      setIsGeneratingOutline(false)
    }
  }

  const saveGeneratedOutline = (content) => {
    const outlines = JSON.parse(localStorage.getItem('generated-outlines') || '[]')
    outlines.unshift({
      id: generateId('outline-'),
      content,
      keywords,
      createdAt: new Date().toISOString()
    })
    if (outlines.length > 10) outlines.pop()
    localStorage.setItem('generated-outlines', JSON.stringify(outlines))
  }

  const handleGenerateChapter = async () => {
    if (!activeChapter || !outline) {
      setShowToast('请先选择章节并生成大纲', 'warning')
      return
    }
    if (!aiConfig.apiKey) {
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
        aiConfig,
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
    if (!aiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    setIsGenerating(true)
    try {
      const result = await polishText(activeChapter.content, polishType, '', aiConfig)
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
    if (!aiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateSummary(activeChapter.content, { length: 'medium', format: 'paragraph' }, aiConfig)
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
    if (!aiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    setIsGenerating(true)
    try {
      const result = await getWritingAdvice(activeChapter.content, aiConfig)
      setShowToast('写作建议已生成：\n' + result, 'info')
    } catch (error) {
      setShowToast('获取建议失败：' + error.message, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChat = async () => {
    if (!chatMessage.trim()) return
    if (!aiConfig.apiKey) {
      setShowToast('请先配置API密钥', 'warning')
      return
    }

    const userMessage = {
      isUser: true,
      content: chatMessage,
      timestamp: new Date().toISOString(),
      id: generateId('msg-')
    }

    const newHistory = [...chatHistory, userMessage]
    setChatHistory(newHistory)
    saveChatSession(newHistory)
    setChatMessage('')
    setChatStreaming(true)

    try {
      let fullResponse = ''
      await chatWithAI(chatMessage, chatHistory, aiConfig, null, [], (chunk, full) => {
        fullResponse = full
        const updatedHistory = [...newHistory, { 
          isUser: false, 
          content: fullResponse,
          timestamp: new Date().toISOString(),
          id: generateId('msg-')
        }]
        setChatHistory(updatedHistory)
      })
      saveChatSession([...newHistory, { 
        isUser: false, 
        content: fullResponse,
        timestamp: new Date().toISOString(),
        id: generateId('msg-')
      }])
    } catch (error) {
      setShowToast('对话失败：' + error.message, 'error')
      const errorMessage = {
        isUser: false,
        content: '抱歉，发生了错误：' + error.message,
        timestamp: new Date().toISOString(),
        id: generateId('msg-'),
        isError: true
      }
      const updatedHistory = [...newHistory, errorMessage]
      setChatHistory(updatedHistory)
      saveChatSession(updatedHistory)
    } finally {
      setChatStreaming(false)
    }
  }

  const copyMessage = async (content) => {
    try {
      await copyToClipboard(content)
      setShowToast('已复制到剪贴板', 'success')
    } catch {
      setShowToast('复制失败', 'error')
    }
  }

  const polishOptions = [
    { value: 'grammar', label: '语法润色', icon: CheckCircle, color: 'text-success' },
    { value: 'style', label: '文风优化', icon: Sparkles, color: 'text-primary' },
    { value: 'emotion', label: '情感增强', icon: Zap, color: 'text-warning' },
    { value: 'logic', label: '逻辑梳理', icon: FileText, color: 'text-info' },
    { value: 'concise', label: '精简提炼', icon: ChevronLeft, color: 'text-secondary' },
    { value: 'expand', label: '扩写丰富', icon: ChevronRight, color: 'text-orange-500' }
  ]

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 z-40 transition-opacity duration-300",
          aiSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setAiSidebarOpen(false)}
        role="presentation"
        aria-hidden="true"
      />

      <div 
        className={cn(
          "fixed right-0 top-0 h-full bg-bg-sidebar text-text-sidebar z-50 transition-transform duration-300 flex flex-col",
          aiSidebarOpen ? "translate-x-0" : "translate-x-full",
          "w-80 md:w-96"
        )}
        role="dialog"
        aria-label="AI助手"
      >
        <div className="flex items-center justify-between p-4 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
            <span className="font-semibold text-lg">AI 助手</span>
          </div>
          <button 
            onClick={() => setAiSidebarOpen(false)}
            className="p-2 hover:bg-bg-sidebar-hover rounded transition-colors"
            aria-label="关闭AI助手"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex border-b border-border-dark" role="tablist">
          {[
            { id: 'outline', label: '大纲', icon: BookOpen },
            { id: 'generate', label: '续写', icon: Wand2 },
            { id: 'polish', label: '润色', icon: Zap },
            { id: 'chat', label: '对话', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                activeTab === tab.id 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-text-muted hover:text-text-sidebar"
              )}
            >
              <tab.icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" role="tabpanel" id={`panel-${activeTab}`}>
          {activeTab === 'outline' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="keywords-input" className="block text-sm font-medium mb-2">
                  小说主题/关键词
                </label>
                <input
                  id="keywords-input"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="例如：科幻、都市、修仙..."
                  className="w-full px-3 py-2 bg-bg-sidebar-hover border border-border-dark rounded-lg text-text-sidebar placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                  aria-describedby="keywords-help"
                />
                <p id="keywords-help" className="text-xs text-text-muted mt-1">
                  输入关键词，AI将为您生成完整大纲
                </p>
              </div>
              
              <button
                onClick={handleGenerateOutline}
                disabled={isGeneratingOutline || !keywords.trim()}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary",
                  isGeneratingOutline && "opacity-70"
                )}
                aria-busy={isGeneratingOutline}
              >
                {isGeneratingOutline ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" aria-hidden="true" />
                    <span>生成大纲</span>
                  </>
                )}
              </button>

              {outline && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">生成的大纲</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(outline)}
                        className="text-xs text-text-muted hover:text-primary p-1"
                        aria-label="复制大纲"
                        title="复制大纲"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => setOutline('')}
                        className="text-xs text-text-muted hover:text-danger p-1"
                        aria-label="清空大纲"
                        title="清空大纲"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-bg-sidebar-hover border border-border-dark rounded-lg text-sm whitespace-pre-wrap max-h-64 overflow-y-auto prose prose-sm prose-invert">
                    {outline}
                  </div>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    去续写章节
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div className="p-3 bg-bg-sidebar-hover border border-border-dark rounded-lg">
                <p className="text-sm text-text-muted">
                  当前章节：<span className="text-text-sidebar font-medium">{activeChapter?.title || '未选择'}</span>
                </p>
              </div>

              {!outline && (
                <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p>请先在「大纲」标签页生成大纲</p>
                </div>
              )}

              <button
                onClick={handleGenerateChapter}
                disabled={isGenerating || !outline || !activeChapter}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary",
                  (isGenerating || !outline) && "opacity-50 cursor-not-allowed"
                )}
                aria-busy={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    <span>生成章节内容</span>
                  </>
                )}
              </button>

              {generatedContent && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">生成内容预览</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(generatedContent)}
                        className="text-xs text-text-muted hover:text-primary p-1"
                        aria-label="复制内容"
                        title="复制内容"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => setGeneratedContent('')}
                        className="text-xs text-text-muted hover:text-danger p-1"
                        aria-label="清空内容"
                        title="清空内容"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-bg-sidebar-hover border border-border-dark rounded-lg text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {generatedContent}
                  </div>
                  <button
                    onClick={handleInsertContent}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    <Search className="w-4 h-4" aria-hidden="true" />
                    插入到编辑器
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'polish' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">选择润色类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {polishOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPolishType(option.value)}
                      className={cn(
                        "px-3 py-2.5 text-sm rounded-lg border transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary",
                        polishType === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border-dark bg-bg-sidebar-hover text-text-muted hover:text-text-sidebar"
                      )}
                      aria-pressed={polishType === option.value}
                    >
                      <option.icon className={cn("w-4 h-4", option.color)} aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {!activeChapter?.content && (
                <div className="p-3 bg-info/10 border border-info/30 rounded-lg text-sm text-info flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p>请先在编辑器中选择章节并输入内容</p>
                </div>
              )}

              <button
                onClick={handlePolish}
                disabled={isGenerating || !activeChapter?.content}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary",
                  (isGenerating || !activeChapter?.content) && "opacity-50 cursor-not-allowed"
                )}
                aria-busy={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>润色中...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" aria-hidden="true" />
                    <span>一键润色</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSummarize}
                  disabled={isGenerating || !activeChapter?.content}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-sidebar-hover border border-border-dark rounded-lg hover:bg-bg-tertiary transition-colors text-text-sidebar disabled:opacity-50 disabled:cursor-not-allowed",
                    (isGenerating || !activeChapter?.content) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  生成摘要
                </button>
                <button
                  onClick={handleGetAdvice}
                  disabled={isGenerating || !activeChapter?.content}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-sidebar-hover border border-border-dark rounded-lg hover:bg-bg-tertiary transition-colors text-text-sidebar disabled:opacity-50 disabled:cursor-not-allowed",
                    (isGenerating || !activeChapter?.content) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  写作建议
                </button>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-4 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">当前对话</h3>
                <div className="flex gap-2">
                  <button
                    onClick={exportChatHistory}
                    className="text-xs text-text-muted hover:text-primary p-1"
                    aria-label="导出对话历史"
                    title="导出对话历史"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={clearChatHistory}
                    className="text-xs text-text-muted hover:text-danger p-1"
                    aria-label="清空对话历史"
                    title="清空对话历史"
                    disabled={chatHistory.length === 0}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-3 min-h-[300px] max-h-[400px]"
                role="log"
                aria-live="polite"
                aria-label="对话历史"
              >
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-text-muted py-12">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-50" aria-hidden="true" />
                    <p className="text-sm font-medium mb-1">暂无对话</p>
                    <p className="text-xs">开始和AI对话吧</p>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div 
                      key={msg.id || index}
                      className={cn(
                        "p-3 rounded-lg group relative",
                        msg.isUser ? "bg-primary/20" : "bg-bg-sidebar-hover"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-xs font-medium",
                          msg.isUser ? "text-primary" : "text-secondary"
                        )}>
                          {msg.isUser ? '我' : 'AI'}
                        </span>
                        {msg.timestamp && (
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {formatRelativeTime(msg.timestamp)}
                          </span>
                        )}
                        {msg.isError && (
                          <span className="text-xs text-danger">错误</span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm whitespace-pre-wrap",
                        msg.isError && "text-danger"
                      )}>
                        {msg.content}
                      </p>
                      <button
                        onClick={() => copyMessage(msg.content)}
                        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-bg-tertiary transition-opacity"
                        aria-label="复制消息"
                        title="复制"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
                {chatStreaming && (
                  <div className="p-3 bg-bg-sidebar-hover rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-secondary">AI</span>
                      <span className="text-xs text-text-muted">生成中...</span>
                    </div>
                    <div className="flex gap-1" aria-label="正在输入">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border-dark">
                <div className="relative">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleChat()
                      }
                    }}
                    placeholder="输入问题，Shift+Enter换行..."
                    className="w-full px-3 py-2.5 pr-10 bg-bg-sidebar-hover border border-border-dark rounded-lg text-text-sidebar placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
                    disabled={chatStreaming}
                    aria-label="输入消息"
                  />
                  <button
                    onClick={handleChat}
                    disabled={!chatMessage.trim() || chatStreaming}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="发送消息"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-xs text-text-muted text-center">
                  按 Enter 发送，Shift + Enter 换行
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={() => setAiSidebarOpen(true)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-bg-sidebar border-l border-border-dark rounded-l-lg hover:bg-bg-sidebar-hover transition-all focus:outline-none focus:ring-2 focus:ring-primary",
          aiSidebarOpen && "opacity-0 pointer-events-none"
        )}
        aria-label="打开AI助手"
      >
        <ChevronLeft className="w-5 h-5 text-text-sidebar" aria-hidden="true" />
      </button>
    </>
  )
}