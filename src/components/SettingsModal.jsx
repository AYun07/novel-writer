import { useState, useEffect } from 'react'
import { X, Key, Globe, Database, Settings as SettingsIcon, CheckCircle, XCircle, Loader, Download, Upload, AlertCircle, Save } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { getProviderList } from '../services/aiService'
import { cn } from '../lib/utils'

export default function SettingsModal() {
  const { showSettings, setShowSettings, aiConfig, setAiConfig, searchConfig, setSearchConfig, embeddingsConfig, setEmbeddingsConfig, systemSettings, setSystemSettings, setShowToast } = useAppStore()
  
  const [activeTab, setActiveTab] = useState('ai')
  const [testingApi, setTestingApi] = useState(false)
  const [apiTestResult, setApiTestResult] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const providers = getProviderList()

  const testApiConnection = async () => {
    setTestingApi(true)
    setApiTestResult(null)
    
    try {
      const response = await fetch(`${aiConfig.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${aiConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setApiTestResult({ success: true, message: 'API连接成功！', data })
        setShowToast('API连接测试成功', 'success')
      } else {
        const error = await response.json().catch(() => ({}))
        setApiTestResult({ success: false, message: `连接失败: ${error.error?.message || response.statusText}` })
        setShowToast('API连接测试失败', 'error')
      }
    } catch (error) {
      setApiTestResult({ success: false, message: `连接错误: ${error.message}` })
      setShowToast('API连接测试失败', 'error')
    } finally {
      setTestingApi(false)
    }
  }

  const testSearchConnection = async () => {
    if (!searchConfig.apiKey) {
      setShowToast('请先配置搜索API密钥', 'warning')
      return
    }
    
    setTestingApi(true)
    setApiTestResult(null)
    
    try {
      const response = await fetch(`${searchConfig.baseUrl || 'https://api.tavily.com'}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: searchConfig.apiKey,
          query: 'test',
          search_depth: 'basic',
          max_results: 1
        })
      })
      
      if (response.ok) {
        setApiTestResult({ success: true, message: '搜索API连接成功！' })
        setShowToast('搜索API连接测试成功', 'success')
      } else {
        throw new Error('搜索API连接失败')
      }
    } catch (error) {
      setApiTestResult({ success: false, message: `搜索API连接错误: ${error.message}` })
      setShowToast('搜索API连接测试失败', 'error')
    } finally {
      setTestingApi(false)
    }
  }

  const exportConfig = () => {
    const config = {
      version: 2,
      exportTime: new Date().toISOString(),
      aiConfig,
      searchConfig,
      embeddingsConfig,
      systemSettings
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowToast('配置已导出', 'success')
  }

  const importConfig = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result)
        
        if (!config.version) {
          throw new Error('无效的配置文件')
        }
        
        if (config.aiConfig) setAiConfig(config.aiConfig)
        if (config.searchConfig) setSearchConfig(config.searchConfig)
        if (config.embeddingsConfig) setEmbeddingsConfig(config.embeddingsConfig)
        if (config.systemSettings) setSystemSettings(config.systemSettings)
        
        setShowToast('配置已导入', 'success')
      } catch (error) {
        setShowToast('导入失败：' + error.message, 'error')
      }
    }
    reader.readAsText(file)
  }

  const resetToDefaults = () => {
    if (!confirm('确定要重置所有设置为默认值吗？')) return
    
    setAiConfig({
      providerType: 'zhipu',
      selectedModel: 'glm-4-flash',
      apiKey: '',
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      temperature: 0.7,
      maxTokens: 2000
    })
    
    setSearchConfig({
      provider: 'tavily',
      apiKey: '',
      baseUrl: 'https://api.tavily.com'
    })
    
    setEmbeddingsConfig({
      provider: 'openai',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'text-embedding-ada-002'
    })
    
    setSystemSettings({
      theme: 'light',
      fontSize: 16,
      autoSave: true,
      autoSaveInterval: 300000,
      language: 'zh-CN'
    })
    
    setShowToast('已重置为默认设置', 'info')
  }

  const saveSettings = () => {
    setIsSaving(true)
    try {
      localStorage.setItem('integrated-author-settings', JSON.stringify({
        aiConfig,
        searchConfig,
        embeddingsConfig,
        systemSettings,
        lastUpdated: new Date().toISOString()
      }))
      setShowToast('设置已保存', 'success')
      setShowSettings(false)
    } catch (error) {
      setShowToast('保存失败：' + error.message, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('integrated-author-settings') || '{}')
    if (savedSettings.aiConfig) setAiConfig(savedSettings.aiConfig)
    if (savedSettings.searchConfig) setSearchConfig(savedSettings.searchConfig)
    if (savedSettings.embeddingsConfig) setEmbeddingsConfig(savedSettings.embeddingsConfig)
    if (savedSettings.systemSettings) setSystemSettings(savedSettings.systemSettings)
  }, [])

  if (!showSettings) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettings(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">设置</h2>
          <button 
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* 侧边栏 */}
          <div className="w-48 border-r border-border p-4 bg-bg-secondary">
            <nav className="space-y-2">
              {[
                { id: 'ai', label: 'AI设置', icon: Key },
                { id: 'search', label: '搜索设置', icon: Globe },
                { id: 'embeddings', label: '向量设置', icon: Database },
                { id: 'system', label: '系统设置', icon: SettingsIcon }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                    activeTab === item.id 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-bg-tertiary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="mt-8 space-y-2">
              <button
                onClick={exportConfig}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-bg-tertiary rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                导出配置
              </button>
              <label className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-bg-tertiary rounded-lg transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                导入配置
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfig}
                  className="hidden"
                />
              </label>
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                重置默认
              </button>
            </div>
          </div>

          {/* 内容区 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* AI设置 */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    AI模型配置
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">AI供应商</label>
                      <select
                        value={aiConfig.providerType}
                        onChange={(e) => setAiConfig({ ...aiConfig, providerType: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {providers.map(p => (
                          <option key={p.value} value={p.value}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">模型选择</label>
                      <select
                        value={aiConfig.selectedModel}
                        onChange={(e) => setAiConfig({ ...aiConfig, selectedModel: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {providers.find(p => p.value === aiConfig.providerType)?.models.map(m => (
                          <option key={m.value} value={m.value}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">API密钥</label>
                      <input
                        type="password"
                        value={aiConfig.apiKey}
                        onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                        placeholder="输入API密钥"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">API地址（可选）</label>
                      <input
                        type="text"
                        value={aiConfig.baseURL}
                        onChange={(e) => setAiConfig({ ...aiConfig, baseURL: e.target.value })}
                        placeholder="留空使用默认地址"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        温度参数（创造性）：{aiConfig.temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={aiConfig.temperature}
                        onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-text-muted mt-1">
                        <span>精确</span>
                        <span>平衡</span>
                        <span>创造</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">最大令牌数</label>
                      <input
                        type="number"
                        value={aiConfig.maxTokens}
                        onChange={(e) => setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) })}
                        min="100"
                        max="128000"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <button
                      onClick={testApiConnection}
                      disabled={testingApi || !aiConfig.apiKey}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {testingApi ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      测试连接
                    </button>

                    {apiTestResult && (
                      <div className={cn(
                        "p-4 rounded-lg border",
                        apiTestResult.success 
                          ? "bg-success/10 border-success/30 text-success" 
                          : "bg-danger/10 border-danger/30 text-danger"
                      )}>
                        <div className="flex items-start gap-2">
                          {apiTestResult.success ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                          )}
                          <span>{apiTestResult.message}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 搜索设置 */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    联网搜索配置
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">搜索服务</label>
                      <select
                        value={searchConfig.provider}
                        onChange={(e) => setSearchConfig({ ...searchConfig, provider: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="tavily">Tavily</option>
                        <option value="exa">Exa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">API密钥</label>
                      <input
                        type="password"
                        value={searchConfig.apiKey}
                        onChange={(e) => setSearchConfig({ ...searchConfig, apiKey: e.target.value })}
                        placeholder="输入搜索API密钥"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">API地址（可选）</label>
                      <input
                        type="text"
                        value={searchConfig.baseUrl}
                        onChange={(e) => setSearchConfig({ ...searchConfig, baseUrl: e.target.value })}
                        placeholder="留空使用默认地址"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <button
                      onClick={testSearchConnection}
                      disabled={testingApi}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {testingApi ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      测试连接
                    </button>

                    <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                      <p className="text-sm text-info">
                        💡 <strong>提示：</strong>联网搜索功能允许AI在生成内容时搜索网络获取最新信息。
                        需要配置 Tavily 或 Exa 的API密钥。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 向量设置 */}
            {activeTab === 'embeddings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    RAG向量化配置
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">向量服务</label>
                      <select
                        value={embeddingsConfig.provider}
                        onChange={(e) => setEmbeddingsConfig({ ...embeddingsConfig, provider: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="local">本地模型</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">API密钥</label>
                      <input
                        type="password"
                        value={embeddingsConfig.apiKey}
                        onChange={(e) => setEmbeddingsConfig({ ...embeddingsConfig, apiKey: e.target.value })}
                        placeholder="输入API密钥"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Embedding模型</label>
                      <input
                        type="text"
                        value={embeddingsConfig.model}
                        onChange={(e) => setEmbeddingsConfig({ ...embeddingsConfig, model: e.target.value })}
                        placeholder="text-embedding-ada-002"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                      <p className="text-sm text-info">
                        💡 <strong>提示：</strong>RAG向量化用于处理长篇巨著，可以将大量文本分块并检索相关片段。
                        推荐使用OpenAI的text-embedding-ada-002模型。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 系统设置 */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    系统设置
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">主题</label>
                      <select
                        value={systemSettings.theme}
                        onChange={(e) => setSystemSettings({ ...systemSettings, theme: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="light">浅色</option>
                        <option value="dark">深色</option>
                        <option value="auto">跟随系统</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">字体大小</label>
                      <input
                        type="number"
                        value={systemSettings.fontSize}
                        onChange={(e) => setSystemSettings({ ...systemSettings, fontSize: parseInt(e.target.value) })}
                        min="12"
                        max="24"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">语言</label>
                      <select
                        value={systemSettings.language}
                        onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="zh-CN">简体中文</option>
                        <option value="zh-TW">繁体中文</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                      <div>
                        <h4 className="font-medium">自动保存</h4>
                        <p className="text-sm text-text-muted">每隔5分钟自动保存到本地</p>
                      </div>
                      <button
                        onClick={() => setSystemSettings({ ...systemSettings, autoSave: !systemSettings.autoSave })}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-colors",
                          systemSettings.autoSave ? "bg-primary" : "bg-gray-300"
                        )}
                      >
                        <span 
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                            systemSettings.autoSave ? "left-7" : "left-1"
                          )}
                        />
                      </button>
                    </div>

                    <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                      <p className="text-sm text-info">
                        💡 <strong>提示：</strong>系统设置会自动保存到浏览器本地存储。
                        导出配置可以备份所有设置，方便在新设备上快速恢复。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-border bg-bg-secondary">
          <button 
            onClick={() => setShowSettings(false)}
            className="px-6 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            取消
          </button>
          <button 
            onClick={saveSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && <Loader className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}