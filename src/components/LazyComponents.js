import dynamic from 'next/dynamic'

export const Sidebar = dynamic(() => import('../components/Sidebar'), {
  loading: () => <div className="w-72 bg-bg-sidebar h-screen animate-pulse" />,
  ssr: false
})

export const Editor = dynamic(() => import('../components/Editor'), {
  loading: () => <div className="flex-1 bg-bg-primary animate-pulse" />,
  ssr: false
})

export const AISidebar = dynamic(() => import('../components/AISidebar'), {
  loading: () => <div className="w-72 bg-bg-sidebar h-screen animate-pulse" />,
  ssr: false
})

export const SettingsModal = dynamic(() => import('../components/SettingsModal'), {
  loading: () => null,
  ssr: false
})

export const LoginModal = dynamic(() => import('../components/LoginModal'), {
  loading: () => null,
  ssr: false
})

export const ExportModal = dynamic(() => import('../components/ExportModal'), {
  loading: () => null,
  ssr: false
})

export const BackupRestore = dynamic(() => import('../components/BackupRestore'), {
  loading: () => null,
  ssr: false
})

export const CharacterManager = dynamic(() => import('../components/CharacterManager'), {
  loading: () => null,
  ssr: false
})

export const WorldSettingsManager = dynamic(() => import('../components/WorldSettingsManager'), {
  loading: () => null,
  ssr: false
})

export const NovelInfoManager = dynamic(() => import('../components/NovelInfoManager'), {
  loading: () => null,
  ssr: false
})

export const CorpusManager = dynamic(() => import('../components/CorpusManager'), {
  loading: () => null,
  ssr: false
})

export const SessionManager = dynamic(() => import('../components/SessionManager'), {
  loading: () => null,
  ssr: false
})

export const TemplateManager = dynamic(() => import('../components/TemplateManager'), {
  loading: () => null,
  ssr: false
})

export const StatsPanel = dynamic(() => import('../components/StatsPanel'), {
  loading: () => <div className="w-80 bg-bg-secondary animate-pulse" />,
  ssr: false
})

export const Toast = dynamic(() => import('../components/Toast'), {
  loading: () => null,
  ssr: false
})