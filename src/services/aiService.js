import axios from 'axios'

const PROVIDER_CONFIGS = {
  zhipu: {
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    models: {
      'glm-4-flash': { name: 'GLM-4 Flash', maxTokens: 128000 },
      'glm-4': { name: 'GLM-4', maxTokens: 128000 },
      'glm-4-plus': { name: 'GLM-4 Plus', maxTokens: 128000 },
      'glm-z1-flash': { name: 'GLM-Z1 Flash', maxTokens: 32000 }
    }
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    models: {
      'deepseek-chat': { name: 'DeepSeek Chat', maxTokens: 64000 },
      'deepseek-coder': { name: 'DeepSeek Coder', maxTokens: 64000 }
    }
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    models: {
      'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', maxTokens: 16385 },
      'gpt-4': { name: 'GPT-4', maxTokens: 8192 },
      'gpt-4-turbo': { name: 'GPT-4 Turbo', maxTokens: 128000 }
    }
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: {
      'gemini-pro': { name: 'Gemini Pro', maxTokens: 30720 },
      'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', maxTokens: 1000000 }
    }
  }
}

const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoff: 2,
  retryableStatusCodes: [429, 500, 502, 503, 504]
}

function getBaseURL(config) {
  return PROVIDER_CONFIGS[config.providerType]?.baseURL || config.baseURL || PROVIDER_CONFIGS.zhipu.baseURL
}

function buildHeaders(config) {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (config.providerType === 'zhipu') {
    headers['Authorization'] = `Bearer ${config.apiKey}`
  } else if (config.providerType === 'deepseek') {
    headers['Authorization'] = `Bearer ${config.apiKey}`
  } else if (config.providerType === 'openai') {
    headers['Authorization'] = `Bearer ${config.apiKey}`
  }
  
  return headers
}

function buildModelName(providerType, selectedModel) {
  if (providerType === 'gemini') {
    return `${selectedModel}:generateContent?key=${this?.config?.apiKey || ''}`
  }
  return selectedModel
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function makeRequestWithRetry(config, messages, options = {}, attempt = 1) {
  const baseURL = getBaseURL(config)
  const headers = buildHeaders(config)
  
  let endpoint = ''
  let requestBody = {}
  
  if (config.providerType === 'gemini') {
    endpoint = `${baseURL}/${config.selectedModel}:generateContent`
    requestBody = {
      contents: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: options.temperature || config.temperature || 0.7,
        maxOutputTokens: options.maxTokens || config.maxTokens || 8192,
        topP: options.topP || 0.9,
        topK: options.topK || 40
      }
    }
  } else {
    endpoint = `${baseURL}/chat/completions`
    requestBody = {
      model: config.selectedModel,
      messages,
      temperature: options.temperature || config.temperature || 0.7,
      max_tokens: options.maxTokens || config.maxTokens || 2000,
      top_p: options.topP || 0.9,
      stream: options.stream || false
    }
    
    if (options.stream) {
      requestBody.stream = true
    }
  }
  
  try {
    const response = await axios.post(endpoint, requestBody, {
      headers,
      timeout: options.timeout || config.timeout || 120000
    })
    
    if (config.providerType === 'gemini') {
      return response.data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    } else {
      return response.data.choices?.[0]?.message?.content || ''
    }
  } catch (error) {
    console.error(`AI请求失败 (尝试 ${attempt}/${RETRY_CONFIG.maxRetries}):`, error)
    
    const status = error.response?.status
    if (status && RETRY_CONFIG.retryableStatusCodes.includes(status) && attempt < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.retryBackoff, attempt - 1)
      console.log(`等待 ${delay}ms 后重试...`)
      await wait(delay)
      return makeRequestWithRetry(config, messages, options, attempt + 1)
    }
    
    if (error.response) {
      const errorMessage = error.response.data?.error?.message || 
                          error.response.data?.message || 
                          `HTTP错误 ${error.response.status}`
      throw new Error(`API错误: ${errorMessage}`)
    } else if (error.request) {
      throw new Error('网络错误: 无法连接到服务器，请检查网络连接')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('请求超时: 服务器响应时间过长')
    } else {
      throw new Error(`请求失败: ${error.message}`)
    }
  }
}

async function* streamRequestWithRetry(config, messages, options = {}, attempt = 1) {
  const baseURL = getBaseURL(config)
  const headers = buildHeaders(config)
  
  let endpoint = ''
  let requestBody = {}
  
  if (config.providerType === 'gemini') {
    endpoint = `${baseURL}/${config.selectedModel}:streamGenerateContent?key=${config.apiKey}`
    requestBody = {
      contents: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: options.temperature || config.temperature || 0.7,
        maxOutputTokens: options.maxTokens || config.maxTokens || 8192
      }
    }
  } else {
    endpoint = `${baseURL}/chat/completions`
    requestBody = {
      model: config.selectedModel,
      messages,
      temperature: options.temperature || config.temperature || 0.7,
      max_tokens: options.maxTokens || config.maxTokens || 2000,
      stream: true
    }
  }
  
  try {
    const response = await axios.post(endpoint, requestBody, {
      headers,
      timeout: options.timeout || config.timeout || 120000,
      responseType: 'stream'
    })
    
    let fullContent = ''
    
    if (config.providerType === 'gemini') {
      for await (const chunk of response.data) {
        const text = chunk.toString()
        try {
          const data = JSON.parse(text)
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (content) {
            fullContent += content
            yield { chunk: content, full: fullContent, error: null }
          }
        } catch (e) {
          continue
        }
      }
    } else {
      for await (const chunk of response.data) {
        const text = chunk.toString()
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              return
            }
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                fullContent += content
                yield { chunk: content, full: fullContent, error: null }
              }
            } catch (e) {
              continue
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`流式请求失败 (尝试 ${attempt}/${RETRY_CONFIG.maxRetries}):`, error)
    
    const status = error.response?.status
    if (status && RETRY_CONFIG.retryableStatusCodes.includes(status) && attempt < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.retryBackoff, attempt - 1)
      console.log(`等待 ${delay}ms 后重试...`)
      await wait(delay)
      yield* streamRequestWithRetry(config, messages, options, attempt + 1)
      return
    }
    
    let errorMessage = '未知错误'
    if (error.response) {
      errorMessage = error.response.data?.error?.message || `HTTP错误 ${error.response.status}`
    } else if (error.request) {
      errorMessage = '网络错误: 无法连接到服务器'
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时'
    } else {
      errorMessage = error.message
    }
    
    yield { chunk: '', full: '', error: new Error(`流式请求失败: ${errorMessage}`) }
  }
}

export async function generateText(prompt, config, options = {}) {
  const messages = [{ role: 'user', content: prompt }]
  return makeRequestWithRetry(config, messages, options)
}

export async function generateTextStream(prompt, config, onChunk, options = {}) {
  const messages = [{ role: 'user', content: prompt }]
  
  for await (const { chunk, full, error } of streamRequestWithRetry(config, messages, options)) {
    if (error) {
      throw error
    }
    if (onChunk) {
      onChunk(chunk, full)
    }
  }
}

export async function chatWithAI(message, history = [], config, systemPrompt = null, tools = [], onChunk = null, options = {}) {
  const messages = []
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  
  history.forEach(msg => {
    messages.push({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    })
  })
  
  messages.push({ role: 'user', content: message })
  
  if (onChunk) {
    for await (const { chunk, full, error } of streamRequestWithRetry(config, messages, options)) {
      if (error) {
        throw error
      }
      onChunk(chunk, full)
    }
  } else {
    return makeRequestWithRetry(config, messages, options)
  }
}

export async function generateOutline(keywords, genre = '', previousOutline = null, config, options = {}) {
  let prompt = `请根据以下主题关键词为一部小说生成详细的大纲结构：\n\n主题/关键词：${keywords}\n`
  
  if (genre) {
    prompt += `类型：${genre}\n`
  }
  
  if (previousOutline) {
    prompt += `\n参考之前的大纲结构：\n${previousOutline}\n`
    prompt += `\n请基于以上信息生成一个新的、更完善的大纲结构。`
  } else {
    prompt += `\n请生成包含以下内容的大纲：
1. 故事背景设定
2. 主要人物介绍（至少3个角色）
3. 故事主线（分5-8章）
4. 每章的主要内容概要
5. 故事高潮和结局设计
6. 伏笔和悬念设置

请用中文回答，格式清晰易读。`
  }
  
  return makeRequestWithRetry(config, [{ role: 'user', content: prompt }], options)
}

export async function generateChapterContentStream(
  chapterTitle,
  outline,
  previousContent = '',
  selectedChapterIndex = null,
  characters = [],
  worldSettings = [],
  novelInfo = {},
  config,
  onChunk,
  options = {}
) {
  let contextPrompt = `请为小说章节"${chapterTitle}"生成详细内容。\n\n`
  
  if (outline) {
    contextPrompt += `小说大纲：\n${outline}\n\n`
  }
  
  if (previousContent) {
    contextPrompt += `前文内容（请保持文风和剧情连贯）：\n${previousContent}\n\n`
  }
  
  if (characters.length > 0) {
    contextPrompt += `角色设定：\n${characters.map(c => `- ${c.name}: ${c.description || '待补充'}`).join('\n')}\n\n`
  }
  
  if (worldSettings.length > 0) {
    contextPrompt += `世界观设定：\n${worldSettings.join('\n')}\n\n`
  }
  
  if (novelInfo.title) {
    contextPrompt += `小说标题：${novelInfo.title}\n`
  }
  if (novelInfo.genre) {
    contextPrompt += `类型：${novelInfo.genre}\n`
  }
  if (novelInfo.style) {
    contextPrompt += `文风：${novelInfo.style}\n`
  }
  
  contextPrompt += `\n请生成约2000-3000字的章节内容，要求：
1. 文笔流畅，情节生动
2. 人物性格鲜明，对话自然
3. 场景描写细腻，画面感强
4. 与前文风格保持一致
5. 适当设置悬念，推动剧情发展

请直接输出章节内容，不要包含标题和格式说明。`
  
  const messages = [{ role: 'user', content: contextPrompt }]
  
  for await (const { chunk, full, error } of streamRequestWithRetry(config, messages, options)) {
    if (error) {
      throw error
    }
    if (onChunk) {
      onChunk(chunk, full)
    }
  }
}

export async function polishText(content, polishType = 'grammar', instructions = '', config, options = {}) {
  const polishPrompts = {
    grammar: '请修正以下文本的语法错误和错别字，保持原文的风格和意思不变：',
    style: '请优化以下文本的文风，使其更加流畅优美，富有文学性：',
    emotion: '请增强以下文本的情感表达，让读者更能感受到角色的情感变化：',
    logic: '请梳理以下文本的逻辑结构，使情节发展更加合理紧凑：',
    concise: '请精简以下文本，去除冗余表达，保留核心内容：',
    expand: '请扩写以下文本，增加细节描写和情感刻画，丰富内容：'
  }
  
  const basePrompt = polishPrompts[polishType] || polishPrompts.grammar
  
  let prompt = basePrompt + '\n\n' + content
  
  if (instructions) {
    prompt += '\n\n额外要求：' + instructions
  }
  
  prompt += '\n\n请直接输出润色后的文本，不要添加任何说明。'
  
  return makeRequestWithRetry(config, [{ role: 'user', content: prompt }], options)
}

export async function generateSummary(content, options = {}, config) {
  const lengthPrompts = {
    short: '简要总结',
    medium: '详细总结',
    long: '全面详细总结'
  }
  
  const formatPrompts = {
    paragraph: '以段落形式呈现',
    bullet: '以要点列表形式呈现',
    outline: '以大纲形式呈现'
  }
  
  const prompt = `${lengthPrompts[options.length] || '详细总结'}${'（约' + (options.length === 'short' ? '100字' : options.length === 'medium' ? '300字' : '500字') + '）'}\n`
    + `${formatPrompts[options.format] || '以段落形式呈现'}以下内容的主要内容和要点：\n\n`
    + content + '\n\n请直接输出总结内容。'
  
  return makeRequestWithRetry(config, [{ role: 'user', content: prompt }], options)
}

export async function getWritingAdvice(content, config, options = {}) {
  const prompt = `请分析以下小说片段，并提供专业的写作建议：\n\n${content}\n\n请从以下几个方面进行评价和建议：
1. 人物塑造
2. 情节设计
3. 场景描写
4. 语言表达
5. 整体结构

请用中文回答，评价要客观具体，建议要实用可行。`
  
  return makeRequestWithRetry(config, [{ role: 'user', content: prompt }], options)
}

export async function webSearch(query, searchConfig, options = {}) {
  if (!searchConfig.apiKey) {
    throw new Error('请先配置搜索API密钥')
  }
  
  let endpoint = ''
  let requestBody = {}
  
  if (searchConfig.provider === 'tavily') {
    endpoint = `${searchConfig.baseUrl || 'https://api.tavily.com'}/search`
    requestBody = {
      api_key: searchConfig.apiKey,
      query,
      search_depth: 'basic',
      max_results: options.maxResults || 5
    }
  } else if (searchConfig.provider === 'exa') {
    endpoint = `${searchConfig.baseUrl || 'https://api.exa.ai'}/search`
    requestBody = {
      api_key: searchConfig.apiKey,
      query,
      num_results: options.maxResults || 5
    }
  }
  
  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: { 'Content-Type': 'application/json' },
      timeout: options.timeout || 30000
    })
    
    if (searchConfig.provider === 'tavily') {
      return response.data.results?.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.content
      })) || []
    } else if (searchConfig.provider === 'exa') {
      return response.data.results?.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.text
      })) || []
    }
  } catch (error) {
    console.error('搜索请求失败:', error)
    if (error.response) {
      throw new Error(`搜索失败: ${error.response.data?.message || '未知错误'}`)
    } else {
      throw new Error(`搜索失败: ${error.message}`)
    }
  }
}

export function getAvailableModels(providerType) {
  return PROVIDER_CONFIGS[providerType]?.models || {}
}

export function getProviderList() {
  return Object.entries(PROVIDER_CONFIGS).map(([key, value]) => ({
    value: key,
    name: key === 'zhipu' ? '智谱 AI' : 
          key === 'deepseek' ? 'DeepSeek' : 
          key === 'openai' ? 'OpenAI' : 
          key === 'gemini' ? 'Google Gemini' : key,
    models: Object.entries(value.models).map(([modelKey, modelValue]) => ({
      value: modelKey,
      name: modelValue.name
    }))
  }))
}

export function validateApiConfig(config) {
  const errors = []
  
  if (!config.apiKey) {
    errors.push('请输入API密钥')
  }
  
  if (!PROVIDER_CONFIGS[config.providerType]) {
    errors.push('请选择有效的AI供应商')
  }
  
  if (!config.selectedModel) {
    errors.push('请选择模型')
  }
  
  return errors
}