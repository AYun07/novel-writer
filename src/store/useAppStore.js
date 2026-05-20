import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function createId() {
  return Date.now().toString()
}

const store = create(
  persist(
    (set, get) => ({
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

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      aiSidebarOpen: false,
      setAiSidebarOpen: (open) => set({ aiSidebarOpen: open }),
      toggleAiSidebar: () => set((state) => ({ aiSidebarOpen: !state.aiSidebarOpen })),

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

      toast: null,
      setToast: (toast) => {
        set({ toast })
        if (toast) {
          setTimeout(() => set({ toast: null }), 3000)
        }
      },
      showToast: (message, type = 'info') => get().setToast({ message, type }),

      contextSelection: new Set(),
      setContextSelection: (selection) => {
        set((state) => {
          const newSelection = typeof selection === 'function' ? selection(state.contextSelection) : selection
          return { contextSelection: newSelection }
        })
      },

      contextItems: [],
      setContextItems: (items) => set({ contextItems: items }),

      chatStreaming: false,
      setChatStreaming: (streaming) => set({ chatStreaming: streaming }),

      sessionStore: { activeSessionId: null, sessions: [] },
      setSessionStore: (action) => {
        set((state) => ({ sessionStore: typeof action === 'function' ? action(state.sessionStore) : action }))
      },

      generationArchive: [],
      setGenerationArchive: (archive) => {
        const val = typeof archive === 'function' ? archive(get().generationArchive) : archive
        set({ generationArchive: val })
      },
      addGenerationArchive: (record) => set((state) => ({ generationArchive: [...state.generationArchive, record] })),

      outline: '',
      setOutline: (content) => set({ outline: content }),
      isGeneratingOutline: false,
      setIsGeneratingOutline: (status) => set({ isGeneratingOutline: status }),

      keywords: '',
      setKeywords: (kw) => set({ keywords: kw }),

      selectedTemplate: null,
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),

      generatedContent: '',
      setGeneratedContent: (content) => set({ generatedContent: content }),

      templates: [],
      setTemplates: (templates) => set({ templates }),

      corpus: [],
      addCorpus: (text) => {
        const newItem = { id: createId(), content: text, createdAt: new Date().toISOString() }
        set((state) => ({ corpus: [...state.corpus, newItem] }))
      },
      removeCorpus: (id) => set((state) => ({ corpus: state.corpus.filter(item => item.id !== id) })),
      setCorpus: (corpus) => set({ corpus }),

      characters: [],
      setCharacters: (characters) => set({ characters }),
      addCharacter: (character) => {
        const newChar = { ...character, id: createId() }
        set((state) => ({ characters: [...state.characters, newChar] }))
      },
      updateCharacter: (id, updates) => set((state) => ({ characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c) })),
      deleteCharacter: (id) => set((state) => ({ characters: state.characters.filter(c => c.id !== id) })),

      timeline: [],
      setTimeline: (events) => set({ timeline: events }),

      worldSettings: [],
      setWorldSettings: (settings) => set({ worldSettings: settings }),

      novelInfo: {},
      setNovelInfo: (info) => set({ novelInfo: info }),

      articleStats: {
        wordCount: 0,
        readingTime: 0,
        sentiment: '',
        tags: [],
        category: '',
        score: 0
      },
      setArticleStats: (stats) => set({ articleStats: stats }),

      articleSummary: '',
      setArticleSummary: (summary) => set({ articleSummary: summary }),

      writingAdvice: '',
      setWritingAdvice: (advice) => set({ writingAdvice: advice }),

      writingGoals: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        dailyProgress: 0,
        weeklyProgress: 0,
        monthlyProgress: 0,
        streak: 0
      },
      setWritingGoals: (goals) => set({ writingGoals: goals }),

      aiConfig: {
        apiKey: '',
        baseURL: 'https://open.bigmodel.cn/api/paas/v4',
        selectedModel: 'glm-4-flash',
        maxTokens: 2000000,
        temperature: 0.7,
        providerType: 'zhipu'
      },
      setAiConfig: (config) => set((state) => ({ aiConfig: { ...state.aiConfig, ...config } })),

      searchConfig: {
        provider: 'tavily',
        apiKey: '',
        baseUrl: ''
      },
      setSearchConfig: (config) => set((state) => ({ searchConfig: { ...state.searchConfig, ...config } })),

      embeddingConfig: {
        enabled: false,
        apiKey: '',
        baseUrl: '',
        model: ''
      },
      setEmbeddingConfig: (config) => set((state) => ({ embeddingConfig: { ...state.embeddingConfig, ...config } })),

      systemSettings: {
        theme: 'light',
        fontSize: 16,
        autoSave: true,
        autoSaveInterval: 300000,
        language: 'zh-CN'
      },
      setSystemSettings: (settings) => set((state) => ({ systemSettings: { ...state.systemSettings, ...settings } })),

      versionHistory: [],
      setVersionHistory: (history) => set({ versionHistory: history }),
      addVersionHistory: (version) => {
        const newVersion = { ...version, id: createId(), timestamp: new Date().toISOString() }
        set((state) => ({ 
          versionHistory: [newVersion, ...state.versionHistory].slice(0, 50) 
        }))
      },

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
      }
    }),
    {
      name: 'integrated-author-storage',
      partialize: (state) => ({
        chapters: state.chapters,
        activeChapterId: state.activeChapterId,
        activeWorkId: state.activeWorkId,
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
        writingStats: state.writingStats
      })
    }
  )
)

export function useAppStore(selector) {
  if (selector) return store(selector)
  return store
}

useAppStore.getState = store.getState
useAppStore.setState = store.setState
useAppStore.subscribe = store.subscribe
