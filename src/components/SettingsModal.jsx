import { useState } from 'react'
import { X, Save, Settings2, Globe, Database, Search } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

export default function SettingsModal() {
  const { 
    showSettings, 
    setShowSettings, 
    apiConfig, 
    setApiConfig, 
    searchConfig, 
    setSearchConfig, 
    embeddingConfig, 
    setEmbeddingConfig, 
    setShowToast 
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('api')

  const handleSave = () => {
    setShowToast('设置已保存', 'success')
    setShowSettings(false)
  }

  const modelOptions = [
    { value: 'glm-4-flash', label: 'GLM-4 Flash' },
    { value: 'glm-4', label: 'GLM-4' },
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gemini-pro', label: 'Gemini Pro' }
  ]

  const providerOptions = [
    { value: 'zhipu', label: '智谱 AI', url: 'https://open.bigmodel.cn/api/paas/v4' },
    { value: 'deepseek', label: 'DeepSeek', url: 'https://api.deepseek.com/v1' },
    { value: 'openai', label: 'OpenAI', url: 'https://api.openai.com/v1' },
    { value: 'gemini', label: 'Google Gemini', url: 'https://generativelanguage.googleapis.com/v1beta' }
  ]

  const searchProviderOptions = [
    { value: 'tavily', label: 'Tavily', url: 'https://api.tavily.com' },
    { value: 'exa', label: 'Exa AI', url: 'https://api.exa.ai' }
  ]

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      showSettings ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettings(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">设置</h2>
          <button 
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-border">
          {[
            { id: 'api', label: 'API 设置', icon: Settings2 },
            { id: 'search', label: '搜索设置', icon: Search },
            { id: 'embedding', label: '向量化', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors",
                activeTab === tab.id 
                  ? "text-primary border-b-2 border-primary bg-primary/5" 
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">API 提供商</label>
                <select
                  value={apiConfig.providerType}
                  onChange={(e) => {
                    const provider = providerOptions.find(p => p.value === e.target.value)
                    setApiConfig({
                      providerType: e.target.value,
                      baseURL: provider?.url || ''
                    })
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  {providerOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API 密钥</label>
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig({ apiKey: e.target.value })}
                  placeholder="sk-xxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API 基础 URL</label>
                <input
                  type="text"
                  value={apiConfig.baseURL}
                  onChange={(e) => setApiConfig({ baseURL: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">选择模型</label>
                <select
                  value={apiConfig.selectedModel}
                  onChange={(e) => setApiConfig({ selectedModel: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  {modelOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">温度 (Temperature)</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={apiConfig.temperature}
                    onChange={(e) => setApiConfig({ temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-text-muted mt-1">{apiConfig.temperature}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">最大 Token</label>
                  <input
                    type="number"
                    value={apiConfig.maxTokens}
                    onChange={(e) => setApiConfig({ maxTokens: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">搜索服务提供商</label>
                <select
                  value={searchConfig.provider}
                  onChange={(e) => {
                    const provider = searchProviderOptions.find(p => p.value === e.target.value)
                    setSearchConfig({
                      provider: e.target.value,
                      baseUrl: provider?.url || ''
                    })
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  {searchProviderOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API 密钥</label>
                <input
                  type="password"
                  value={searchConfig.apiKey}
                  onChange={(e) => setSearchConfig({ apiKey: e.target.value })}
                  placeholder="搜索 API 密钥"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API 基础 URL</label>
                <input
                  type="text"
                  value={searchConfig.baseUrl}
                  onChange={(e) => setSearchConfig({ baseUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                />
              </div>

              <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                <p className="text-sm text-info">
                  <Globe className="w-4 h-4 inline mr-2" />
                  启用搜索功能后，AI 在回答问题时可以联网获取最新信息。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'embedding' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={embeddingConfig.enabled}
                    onChange={(e) => setEmbeddingConfig({ enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">启用向量化检索</span>
                </label>
              </div>

              {embeddingConfig.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">API 密钥</label>
                    <input
                      type="password"
                      value={embeddingConfig.apiKey}
                      onChange={(e) => setEmbeddingConfig({ apiKey: e.target.value })}
                      placeholder="Embedding API 密钥"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">API 基础 URL</label>
                    <input
                      type="text"
                      value={embeddingConfig.baseUrl}
                      onChange={(e) => setEmbeddingConfig({ baseUrl: e.target.value })}
                      placeholder="https://api.example.com/v1"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">模型名称</label>
                    <input
                      type="text"
                      value={embeddingConfig.model}
                      onChange={(e) => setEmbeddingConfig({ model: e.target.value })}
                      placeholder="text-embedding-3-small"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                    <p className="text-sm text-info">
                      <Database className="w-4 h-4 inline mr-2" />
                      向量化检索可以帮助 AI 更好地理解您的小说设定和上下文，提供更精准的写作建议。
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-border bg-bg-secondary">
          <button 
            onClick={() => setShowSettings(false)}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Save className="w-4 h-4" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}