import { useState } from 'react'
import { X, MessageSquare, Plus, Trash2, Clock, Send } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'
import dynamic from 'next/dynamic'

const EmptyState = dynamic(() => import('./EmptyState'), {
  ssr: false,
  loading: () => <div className="py-12"><div className="animate-pulse space-y-3"><div className="h-20 bg-bg-secondary rounded-lg"></div><div className="h-24 bg-bg-secondary rounded-lg"></div></div></div>
})

export default function SessionManager() {
  const { 
    showSessionModal, 
    setShowSessionModal,
    sessionStore,
    setSessionStore,
    setShowToast
  } = useAppStore()

  const [selectedSession, setSelectedSession] = useState(null)
  const [newMessage, setNewMessage] = useState('')

  const { sessions = [], activeSessionId } = sessionStore

  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: `对话 ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setSessionStore((state) => ({
      ...state,
      sessions: [newSession, ...state.sessions],
      activeSessionId: newSession.id
    }))

    setSelectedSession(newSession)
    setShowToast('新对话已创建', 'success')
  }

  const selectSession = (session) => {
    setSelectedSession(session)
    setSessionStore((state) => ({
      ...state,
      activeSessionId: session.id
    }))
  }

  const deleteSession = (sessionId) => {
    if (confirm('确定要删除这个对话吗？')) {
      setSessionStore((state) => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        activeSessionId: state.activeSessionId === sessionId 
          ? (state.sessions.length > 1 ? state.sessions[1].id : null)
          : state.activeSessionId
      }))
      
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null)
      }
      
      setShowToast('对话已删除', 'info')
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    }

    const updatedSession = {
      ...selectedSession,
      messages: [...selectedSession.messages, userMessage],
      updatedAt: new Date().toISOString()
    }

    setSessionStore((state) => ({
      ...state,
      sessions: state.sessions.map(s => 
        s.id === selectedSession.id ? updatedSession : s
      )
    }))

    setSelectedSession(updatedSession)
    setNewMessage('')
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    return date.toLocaleDateString()
  }

  if (!showSessionModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowSessionModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">对话管理</h2>
            <span className="text-sm text-text-muted">({sessions.length} 个对话)</span>
          </div>
          <button 
            onClick={() => setShowSessionModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 对话列表 */}
          <div className="w-80 border-r border-border overflow-y-auto">
            <div className="p-4 space-y-2">
              <button
                onClick={createNewSession}
                className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建对话
              </button>

              {sessions.length === 0 ? (
                <EmptyState
                  type="chapters"
                  className="py-8"
                  title="暂无对话"
                  description="创建对话来整理你的创作思路"
                  action={{
                    label: '创建对话',
                    onClick: createNewSession
                  }}
                />
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all group",
                      activeSessionId === session.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => selectSession(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{session.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                          <Clock className="w-3 h-3" />
                          {formatTime(session.updatedAt)}
                          <span>•</span>
                          <span>{session.messages.length} 条消息</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(session.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-danger/10 rounded transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 对话内容 */}
          <div className="flex-1 flex flex-col">
            {selectedSession ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedSession.messages.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">暂无消息</p>
                      <p className="text-xs mt-1">开始发送消息吧</p>
                    </div>
                  ) : (
                    selectedSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.role === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] p-4 rounded-lg",
                            message.role === 'user'
                              ? "bg-primary text-white"
                              : "bg-bg-secondary text-text-primary"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={cn(
                            "text-xs mt-2",
                            message.role === 'user' ? "text-white/70" : "text-text-muted"
                          )}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 消息输入 */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-muted">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">选择一个对话</p>
                  <p className="text-sm mt-1">或创建新对话开始聊天</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
