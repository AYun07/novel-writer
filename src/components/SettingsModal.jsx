import { useState, useEffect } from 'react'
import { X, Key, Globe, Database, Settings as SettingsIcon, CheckCircle, XCircle, Loader, Download, Upload, AlertCircle, Save, Palette, Type, Keyboard, Monitor, Eye } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { getProviderList } from '../services/aiService'
import { cn } from '../lib/utils'

const colorSchemes = [
  { id: 'blue', name: '蓝色主题', primary: '#3b82f6' },
  { id: 'green', name: '绿色主题', primary: '#10b981' },
  { id: 'purple', name: '紫色主题', primary: '#8b5cf6' },
  { id: 'orange', name: '橙色主题', primary: '#f59e0b' },
  { id: 'pink', name: '粉色主题', primary: '#ec4899' },
  { id: 'cyan', name: '青色主题', primary: '#06b6d4' }
]

const fontOptions = [
  { id: 'system', name: '系统默认', css: 'system-ui, sans-serif' },
  { id: 'song', name: '宋体', css: 'SimSun, STSong, serif' },
  { id: 'hei', name: '黑体', css: 'SimHei, STHeiti, sans-serif' },
  { id: 'kaiti', name: '楷体', css: 'KaiTi, STKaiti, serif' },
  { id: 'fangsong', name: '仿宋', css: 'FangSong, STFangsong, serif' }
]

export default function SettingsModal() {
  const { showSettings, setShowSettings, aiConfig, setAiConfig, searchConfig, setSearchConfig, embeddingsConfig, setEmbeddingsConfig, systemSettings, setSystemSettings, setShowToast, colorScheme, setColorScheme, typewriterMode, setTypewriterMode, theme, setTheme } = useAppStore()

  const [activeTab, setActiveTab] = useState('ai')
  const [testingApi, setTestingApi] = useState(false)
  const [apiTestResult, setApiTestResult] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState({
    fontSize: 16,
    lineHeight: 1.8,
    font: 'system',
    autoSave: true,
    autoSaveInterval: 5,
    showWordCount: true,
    typewriterMode: false
  })

  const providers = getProviderList()

  useEffect(() => {
    setLocalSettings({
      fontSize: systemSettings?.fontSize || 16,
      lineHeight: systemSettings?.lineHeight || 1.8,
      font: systemSettings?.font || 'system',
      autoSave: systemSettings?.autoSave !== false,
      autoSaveInterval: systemSettings?.autoSaveInterval || 5,
      showWordCount: systemSettings?.showWordCount !== false,
      typewriterMode: typewriterMode
    })
  }, [systemSettings, typewriterMode])

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
      maxTokens: 2000000
    })
    
    setSearchConfig({
      provider: 'tavily',
      apiKey: '',
      baseUrl: ''
    })
    
    setEmbeddingsConfig({
      provider: 'openai',
      apiKey: '',
      baseUrl: '',
      model: 'text-embedding-ada-002'
    })
    
    setSystemSettings({
      theme: 'light',
      fontSize: 16,
      autoSave: true,
      autoSaveInterval: 300000,
      language: 'zh-CN'
    })
    
    setColorScheme('blue')
    setTypewriterMode(false)
    setTheme('light')
    
    setShowToast('已重置为默认设置', 'info')
  }

  const saveSettings = () => {
    setIsSaving(true)
    try {
      setSystemSettings({
        ...systemSettings,
        ...localSettings
      })
      localStorage.setItem('integrated-author-settings', JSON.stringify({
        aiConfig,
        searchConfig,
        embeddingsConfig,
        systemSettings: {
          ...systemSettings,
          ...localSettings
        },
        colorScheme,
        typewriterMode,
        theme,
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

  if (!showSettings) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettings(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            设置
          </h2>
          <button 
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          <div className="w-56 border-r border-border p-4 bg-bg-secondary">
            <nav className="space-y-1">
              {[
                { id: 'ai', name: 'AI配置', icon: Key },
                { id: 'search', name: '搜索配置', icon: Globe },
                { id: 'embeddings', name: '向量配置', icon: Database },
                { id: 'appearance', name: '外观设置', icon: Palette },
                { id: 'editor', name: '编辑器设置', icon: Type },
                { id: 'system', name: '系统设置', icon: Monitor }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                    activeTab === item.id 
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-bg-tertiary text-text-primary"
                  )}
                >
                  <item.icon className="w-4.5 h-4.5" />
                  <span className="text-sm">{item.name}</span>
                </button>
              ))}
            </nav>
            
            <div className="mt-8 space-y-1">
              <button
                onClick={exportConfig}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-bg-tertiary rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                导出配置
              </button>
              <label className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-bg-tertiary rounded-lg transition-colors cursor-pointer">
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
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                重置默认
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    AI模型配置
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">AI提供商</label>
                      <select
                        value={aiConfig.providerType}
                        onChange={(e) => setAiConfig({ ...aiConfig, providerType: e.target.value })}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">API地址（可选）</label>
                      <input
                        type="text"
                        value={aiConfig.baseURL}
                        onChange={(e) => setAiConfig({ ...aiConfig, baseURL: e.target.value })}
                        placeholder="留空使用默认地址"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        温度参数（创造性）: {aiConfig.temperature}
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
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <button
                      onClick={testApiConnection}
                      disabled={testingApi || !aiConfig.apiKey}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
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
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">API地址（可选）</label>
                      <input
                        type="text"
                        value={searchConfig.baseUrl}
                        onChange={(e) => setSearchConfig({ ...searchConfig, baseUrl: e.target.value })}
                        placeholder="留空使用默认地址"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <button
                      onClick={testSearchConnection}
                      disabled={testingApi}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
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
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Embedding模型</label>
                      <input
                        type="text"
                        value={embeddingsConfig.model}
                        onChange={(e) => setEmbeddingsConfig({ ...embeddingsConfig, model: e.target.value })}
                        placeholder="text-embedding-ada-002"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
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

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    外观设置
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-3">主题模式</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'light', name: '浅色', icon: '☀️' },
                          { id: 'dark', name: '深色', icon: '🌙' },
                          { id: 'auto', name: '跟随系统', icon: '💻' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                              "p-3 border rounded-lg transition-all text-center",
                              theme === t.id 
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-bg-tertiary"
                            )}
                          >
                            <div className="text-2xl mb-1">{t.icon}</div>
                            <div className="text-sm">{t.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">主题配色</label>
                      <div className="grid grid-cols-6 gap-3">
                        {colorSchemes.map(scheme => (
                          <button
                            key={scheme.id}
                            onClick={() => setColorScheme(scheme.id)}
                            title={scheme.name}
                            className={cn(
                              "w-12 h-12 rounded-full transition-transform hover:scale-110",
                              colorScheme === scheme.id ? "ring-2 ring-offset-2 ring-offset-bg-primary ring-black/20" : ""
                            )}
                            style={{ backgroundColor: scheme.primary }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    编辑器设置
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">字体</label>
                      <select
                        value={localSettings.font}
                        onChange={(e) => setLocalSettings({ ...localSettings, font: e.target.value })}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {fontOptions.map(font => (
                          <option key={font.id} value={font.id}>{font.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">字体大小: {localSettings.fontSize}px</label>
                      <input
                        type="range"
                        min="12"
                        max="28"
                        value={localSettings.fontSize}
                        onChange={(e) => setLocalSettings({ ...localSettings, fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">行高: {localSettings.lineHeight}</label>
                      <input
                        type="range"
                        min="1.2"
                        max="2.5"
                        step="0.1"
                        value={localSettings.lineHeight}
                        onChange={(e) => setLocalSettings({ ...localSettings, lineHeight: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <Eye className="w-4.5 h-4.5" />
                            打字机模式
                          </h4>
                          <p className="text-sm text-text-muted mt-1">自动滚动，保持当前行在屏幕中央</p>
                        </div>
                        <button
                          onClick={() => {
                            setTypewriterMode(!typewriterMode)
                            setLocalSettings({ ...localSettings, typewriterMode: !typewriterMode })
                          }}
                          className={cn(
                            "relative w-12 h-6 rounded-full transition-colors",
                            typewriterMode ? "bg-primary" : "bg-gray-300"
                          )}
                        >
                          <span className={cn(
                            "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                            typewriterMode ? "left-6.5" : "left-0.5"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                        <div>
                          <h4 className="font-medium">显示字数统计</h4>
                          <p className="text-sm text-text-muted mt-1">在编辑器右侧显示实时字数统计</p>
                        </div>
                        <button
                          onClick={() => setLocalSettings({ ...localSettings, showWordCount: !localSettings.showWordCount })}
                          className={cn(
                            "relative w-12 h-6 rounded-full transition-colors",
                            localSettings.showWordCount ? "bg-primary" : "bg-gray-300"
                          )}
                        >
                          <span className={cn(
                            "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                            localSettings.showWordCount ? "left-6.5" : "left-0.5"
                          )} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">自动保存间隔（分钟）</label>
                        <select
                          value={localSettings.autoSaveInterval}
                          onChange={(e) => setLocalSettings({ ...localSettings, autoSaveInterval: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value={1}>1 分钟</option>
                          <option value={3}>3 分钟</option>
                          <option value={5}>5 分钟</option>
                          <option value={10}>10 分钟</option>
                          <option value={30}>30 分钟</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    系统设置
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">语言</label>
                      <select
                        value={systemSettings?.language || 'zh-CN'}
                        onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="zh-CN">简体中文</option>
                        <option value="zh-TW">繁体中文</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                      <div>
                        <h4 className="font-medium">自动保存</h4>
                        <p className="text-sm text-text-muted">每隔一段时间自动保存到本地</p>
                      </div>
                      <button
                        onClick={() => setLocalSettings({ ...localSettings, autoSave: !localSettings.autoSave })}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-colors",
                          localSettings.autoSave ? "bg-primary" : "bg-gray-300"
                        )}
                      >
                        <span className={cn(
                          "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          localSettings.autoSave ? "left-6.5" : "left-0.5"
                        )} />
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
            className="px-6 py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            取消
          </button>
          <button 
            onClick={saveSettings}
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-50"
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
