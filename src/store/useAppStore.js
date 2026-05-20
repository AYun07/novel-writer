import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function createId() {
  return Date.now().toString()
}

const defaultProjects = [
  {
    id: 'default',
    name: '我的第一部小说',
    description: '开始创作你的第一个故事',
    genre: '奇幻',
    coverColor: '#3b82f6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
    chapters: [],
    characters: [],
    worldSettings: [],
    novelInfo: {},
    corpus: [],
    templates: []
  }
]

const defaultAchievements = [
  { id: 'first_chapter', name: '开篇之作', description: '完成第一个章节', unlocked: false, unlockedAt: null, icon: '📖' },
  { id: 'first_1000_words', name: '千字起步', description: '单章达到1000字', unlocked: false, unlockedAt: null, icon: '✍️' },
  { id: 'first_10000_words', name: '万字达成', description: '项目总字数破万', unlocked: false, unlockedAt: null, icon: '🏆' },
  { id: '7_day_streak', name: '七天连载', description: '连续写作7天', unlocked: false, unlockedAt: null, icon: '🔥' },
  { id: '30_day_streak', name: '坚持不懈', description: '连续写作30天', unlocked: false, unlockedAt: null, icon: '⭐' },
  { id: 'first_character', name: '创造人物', description: '创建第一个角色', unlocked: false, unlockedAt: null, icon: '👤' },
  { id: '10_characters', name: '人物众多', description: '创建10个角色', unlocked: false, unlockedAt: null, icon: '👥' },
  { id: 'first_ai_generate', name: 'AI助力', description: '使用AI生成内容', unlocked: false, unlockedAt: null, icon: '🤖' },
  { id: 'first_export', name: '完成作品', description: '第一次导出作品', unlocked: false, unlockedAt: null, icon: '📦' },
  { id: 'first_backup', name: '安全意识', description: '创建第一次备份', unlocked: false, unlockedAt: null, icon: '💾' }
]

const store = create(
  persist(
    (set, get) => ({
      // 多项目管理
      projects: defaultProjects,
      setProjects: (projects) => set({ projects }),
      activeProject: defaultProjects[0],
      setActiveProject: (project) => set({ 
        activeProject: project,
        chapters: project?.chapters || [],
        characters: project?.characters || [],
        worldSettings: project?.worldSettings || [],
        novelInfo: project?.novelInfo || {},
        corpus: project?.corpus || [],
        templates: project?.templates || []
      }),
      showProjectSelector: false,
      setShowProjectSelector: (show) => set({ showProjectSelector: !!show }),

      // 章节管理
      chapters: [],
      activeChapterId: null,
      activeWorkId: null,
      setChapters: (chapters) => {
        const valid = Array.isArray(chapters) ? chapters.filter(ch => ch && typeof ch === 'object' && ch.id) : []
        set({ chapters: valid })
      },
      setActiveChapterId: (id) => set({ activeChapterId: id }),
      setActiveWorkId: (id) => set({ activeWorkId: id }),
      addChapter: (chapter) => set((state) => ({ chapters: [...state.chapters, chapter] })),
      deleteChapter: (id) => set((state) => ({ chapters: state.chapters.filter((ch) => ch.id !== id) })),
      updateChapter: (id, updates) => {
        set((state) => ({
          chapters: state.chapters.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch))
        }))
      },
      reorderChapters: (newChapters) => set({ chapters: newChapters }),

      // 侧边栏和布局
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      aiSidebarOpen: false,
      setAiSidebarOpen: (open) => set({ aiSidebarOpen: open }),
      toggleAiSidebar: () => set((state) => ({ aiSidebarOpen: !state.aiSidebarOpen })),

      // 各种模态框
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: !!show }),

      showLoginModal: false,
      setShowLoginModal: (show) => set({ showLoginModal: !!show }),

      showExportModal: false,
      setShowExportModal: (show) => set({ showExportModal: !!show }),

      showBackupModal: false,
      setShowBackupModal: (show) => set({ showBackupModal: !!show }),

      showCharacterModal: false,
      setShowCharacterModal: (show) => set({ showCharacterModal: !!show }),

      showWorldModal: false,
      setShowWorldModal: (show) => set({ showWorldModal: !!show }),

      showNovelInfoModal: false,
      setShowNovelInfoModal: (show) => set({ showNovelInfoModal: !!show }),

      showCorpusModal: false,
      setShowCorpusModal: (show) => set({ showCorpusModal: !!show }),

      showSessionModal: false,
      setShowSessionModal: (show) => set({ showSessionModal: !!show }),

      showTemplateModal: false,
      setShowTemplateModal: (show) => set({ showTemplateModal: !!show }),

      showTimelineModal: false,
      setShowTimelineModal: (show) => set({ showTimelineModal: !!show }),

      showVersionHistoryModal: false,
      setShowVersionHistoryModal: (show) => set({ showVersionHistoryModal: !!show }),

      showToolsModal: false,
      setShowToolsModal: (show) => set({ showToolsModal: !!show }),

      showReadingMode: false,
      setShowReadingMode: (show) => set({ showReadingMode: !!show }),

      showFocusMode: false,
      setShowFocusMode: (show) => set({ showFocusMode: !!show }),

      // 主题和外观
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      colorScheme: 'blue',
      setColorScheme: (colorScheme) => set({ colorScheme }),

      typewriterMode: false,
      setTypewriterMode: (enabled) => set({ typewriterMode: enabled }),

      writingMode: 'webnovel',
      setWritingMode: (mode) => set({ writingMode: mode }),

      language: 'zh-CN',
      setLanguage: (lang) => set({ language: lang }),

      // Toast通知
      toast: null,
      setToast: (toast) => {
        set({ toast })
        if (toast) {
          setTimeout(() => set({ toast: null }), 3000)
        }
      },
      showToast: (message, type = 'info') => get().setToast({ message, type }),

      // AI上下文
      contextSelection: new Set(),
      setContextSelection: (selection) => {
        set((state) => ({
          contextSelection: typeof selection === 'function' ? selection(state.contextSelection) : selection
        }))
      },

      contextItems: [],
      setContextItems: (items) => set({ contextItems: items }),

      chatStreaming: false,
      setChatStreaming: (streaming) => set({ chatStreaming: streaming }),

      // 会话管理
      sessionStore: { activeSessionId: null, sessions: [] },
      setSessionStore: (action) => {
        set((state) => ({ sessionStore: typeof action === 'function' ? action(state.sessionStore) : action }))
      },

      // 生成历史
      generationArchive: [],
      setGenerationArchive: (archive) => {
        const val = typeof archive === 'function' ? archive(get().generationArchive) : archive
        set({ generationArchive: val })
      },
      addGenerationArchive: (record) => set((state) => ({ generationArchive: [...state.generationArchive, record] })),

      // 大纲
      outline: '',
      setOutline: (content) => set({ outline: content }),
      isGeneratingOutline: false,
      setIsGeneratingOutline: (status) => set({ isGeneratingOutline: status }),

      // 关键词
      keywords: '',
      setKeywords: (kw) => set({ keywords: kw }),

      // 模板
      selectedTemplate: null,
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),

      generatedContent: '',
      setGeneratedContent: (content) => set({ generatedContent: content }),

      templates: [],
      setTemplates: (templates) => set({ templates }),

      // 语料库
      corpus: [],
      addCorpus: (text) => {
        const newItem = { id: createId(), content: text, createdAt: new Date().toISOString() }
        set((state) => ({ corpus: [...state.corpus, newItem] }))
      },
      removeCorpus: (id) => set((state) => ({ corpus: state.corpus.filter(item => item.id !== id) })),
      setCorpus: (corpus) => set({ corpus }),

      // 角色
      characters: [],
      setCharacters: (characters) => set({ characters }),
      addCharacter: (character) => {
        const newChar = { ...character, id: createId() }
        set((state) => ({ characters: [...state.characters, newChar] }))
      },
      updateCharacter: (id, updates) => set((state) => ({ characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c) })),
      deleteCharacter: (id) => set((state) => ({ characters: state.characters.filter(c => c.id !== id) })),

      // 时间轴
      timeline: [],
      setTimeline: (events) => set({ timeline: events }),

      // 世界设定
      worldSettings: [],
      setWorldSettings: (settings) => set({ worldSettings: settings }),

      // 小说信息
      novelInfo: {},
      setNovelInfo: (info) => set({ novelInfo: info }),

      // 文章统计
      articleStats: {
        wordCount: 0,
        readingTime: 0,
        sentiment: '',
        tags: [],
        category: '',
        score: 0
      },
      setArticleStats: (stats) => set({ articleStats: stats }),

      // 摘要
      articleSummary: '',
      setArticleSummary: (summary) => set({ articleSummary: summary }),

      // 写作建议
      writingAdvice: '',
      setWritingAdvice: (advice) => set({ writingAdvice: advice }),

      // 写作目标
      writingGoals: {
        daily: 2000,
        weekly: 14000,
        monthly: 60000,
        dailyProgress: 0,
        weeklyProgress: 0,
        monthlyProgress: 0,
        streak: 0
      },
      setWritingGoals: (goals) => set({ writingGoals: goals }),

      // 每日写作统计
      writingStats: {},
      setWritingStats: (stats) => set({ writingStats: stats }),
      addDailyWriting: (wordCount) => {
        const today = new Date().toISOString().split('T')[0]
        set((state) => {
          const newStats = { ...state.writingStats }
          if (!newStats[today]) {
            newStats[today] = 0
          }
          newStats[today] += wordCount
          return { writingStats: newStats }
        })
      },

      // AI配置
      aiConfig: {
        apiKey: '',
        baseURL: 'https://open.bigmodel.cn/api/paas/v4',
        selectedModel: 'glm-4-flash',
        maxTokens: 2000000,
        temperature: 0.7,
        providerType: 'zhipu'
      },
      setAiConfig: (config) => set((state) => ({ aiConfig: { ...state.aiConfig, ...config } })),

      // 搜索配置
      searchConfig: {
        provider: 'tavily',
        apiKey: '',
        baseUrl: ''
      },
      setSearchConfig: (config) => set((state) => ({ searchConfig: { ...state.searchConfig, ...config } })),

      // 向量配置
      embeddingConfig: {
        enabled: false,
        apiKey: '',
        baseUrl: '',
        model: ''
      },
      setEmbeddingConfig: (config) => set((state) => ({ embeddingConfig: { ...state.embeddingConfig, ...config } })),

      // 系统设置
      systemSettings: {
        theme: 'light',
        fontSize: 18,
        autoSave: true,
        autoSaveInterval: 300000,
        language: 'zh-CN'
      },
      setSystemSettings: (settings) => set((state) => ({ systemSettings: { ...state.systemSettings, ...settings } })),

      // 版本历史
      versionHistory: [],
      setVersionHistory: (history) => set({ versionHistory: history }),
      addVersionHistory: (version) => {
        const newVersion = { ...version, id: createId(), timestamp: new Date().toISOString() }
        set((state) => ({ versionHistory: [newVersion, ...state.versionHistory].slice(0, 50) }))
      },

      // 成就系统
      achievements: defaultAchievements,
      setAchievements: (achievements) => set({ achievements }),
      unlockAchievement: (achievementId) => {
        set((state) => {
          const alreadyUnlocked = state.achievements.find(a => a.id === achievementId)?.unlocked
          if (alreadyUnlocked) return state
          
          return {
            achievements: state.achievements.map(a => 
              a.id === achievementId 
                ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
                : a
            )
          }
        })
      },

      // 番茄钟
      pomodoroTime: 25,
      setPomodoroTime: (time) => set({ pomodoroTime: time }),
      isPomodoroRunning: false,
      setIsPomodoroRunning: (running) => set({ isPomodoroRunning: running }),
      
      // UI模态框显示状态
      showAchievements: false,
      setShowAchievements: (show) => set({ showAchievements: show }),
      
      showPomodoro: false,
      setShowPomodoro: (show) => set({ showPomodoro: show }),
      
      showReadingMode: false,
      setShowReadingMode: (show) => set({ showReadingMode: !!show }),
      
      showFocusMode: false,
      setShowFocusMode: (show) => set({ showFocusMode: !!show }),

      // 笔记系统
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => {
        const newNote = { ...note, id: createId(), createdAt: new Date().toISOString() }
        set((state) => ({ notes: [...state.notes, newNote] }))
      },
      updateNote: (id, updates) => set((state) => ({ notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n) })),
      deleteNote: (id) => set((state) => ({ notes: state.notes.filter(n => n.id !== id) }))
    }),
    {
      name: 'integrated-author-storage',
      partialize: (state) => ({
        projects: state.projects,
        activeProject: state.activeProject,
        chapters: state.chapters,
        activeChapterId: state.activeChapterId,
        sidebarOpen: state.sidebarOpen,
        aiSidebarOpen: state.aiSidebarOpen,
        theme: state.theme,
        colorScheme: state.colorScheme,
        typewriterMode: state.typewriterMode,
        writingMode: state.writingMode,
        language: state.language,
        aiConfig: state.aiConfig,
        searchConfig: state.searchConfig,
        embeddingConfig: state.embeddingConfig,
        systemSettings: state.systemSettings,
        writingGoals: state.writingGoals,
        templates: state.templates,
        corpus: state.corpus,
        characters: state.characters,
        timeline: state.timeline,
        worldSettings: state.worldSettings,
        novelInfo: state.novelInfo,
        versionHistory: state.versionHistory,
        writingStats: state.writingStats,
        achievements: state.achievements,
        notes: state.notes
      })
    }
  )
)

export function useAppStore(selector) {
  return store(selector)
}

useAppStore.getState = store.getState
useAppStore.setState = store.setState
useAppStore.subscribe = store.subscribe
