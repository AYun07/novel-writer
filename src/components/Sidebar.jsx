import { BookOpen, FolderPlus, Settings, User, ChevronLeft, ChevronRight, Plus, Trash2, Edit3, Eye, Download, Save, UserCircle, Globe, Book, Database, Zap, MessageSquare, FileText } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import dynamic from 'next/dynamic';

const EmptyState = dynamic(() => import('./EmptyState'), {
  ssr: false,
  loading: () => <div className="py-8"><div className="animate-pulse space-y-3"><div className="h-20 bg-bg-sidebar-hover rounded-lg"></div><div className="h-16 bg-bg-sidebar-hover rounded-lg"></div></div></div>
})

export default function Sidebar() {
 const { sidebarOpen, setSidebarOpen, chapters, activeChapterId, setActiveChapterId, addChapter, deleteChapter, updateChapter, showSettings, setShowSettings, showLoginModal, setShowLoginModal, setShowExportModal, setShowBackupModal, setShowCharacterModal, setShowWorldModal, setShowNovelInfoModal, setShowCorpusModal, setShowSessionModal, setShowTemplateModal, characters, worldSettings, corpus, novelInfo, sessionStore, templates } = useAppStore();
 const handleAddChapter = () => {
 const newChapter = {
 id: `${Date.now()}`,
 title: `章节 ${chapters.length + 1}`,
 content: '',
 generatedText: '',
 isCompleted: false,
 createdAt: new Date().toISOString()
 };
 addChapter(newChapter);
 setActiveChapterId(newChapter.id);
 };
 const handleDeleteChapter = (id) => {
 deleteChapter(id);
 if (activeChapterId === id) {
 const remaining = chapters.filter(c => c.id !== id);
 setActiveChapterId(remaining.length > 0 ? remaining[0].id : null);
 }
 };
 return (<>
 <div className={cn("fixed inset-0 bg-black/20 z-40 transition-opacity duration-300", sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setSidebarOpen(false)}/>
 
 <div className={cn("fixed left-0 top-0 h-full bg-bg-sidebar text-text-sidebar z-50 transition-transform duration-300 flex flex-col", sidebarOpen ? "translate-x-0" : "-translate-x-full", "w-72")}>
 <div className="flex items-center justify-between p-4 border-b border-border-dark">
 <div className="flex items-center gap-2">
 <BookOpen className="w-6 h-6 text-primary"/>
 <span className="font-semibold text-lg">Integrated Author</span>
 </div>
 <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-bg-sidebar-hover rounded">
 <ChevronLeft className="w-5 h-5"/>
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
 <div className="space-y-4">
 {/* 小说信息 */}
 <button onClick={() => setShowNovelInfoModal(true)} className="w-full flex items-center justify-between p-3 bg-bg-sidebar-hover rounded-lg hover:bg-bg-sidebar-hover/80 transition-colors">
 <div className="flex items-center gap-3">
 <Book className="w-5 h-5 text-primary"/>
 <div className="text-left">
 <p className="text-sm font-medium">{novelInfo.title || '未命名小说'}</p>
 <p className="text-xs text-text-muted mt-0.5">{novelInfo.genre || '选择类型'}</p>
 </div>
 </div>
 <Zap className="w-4 h-4 text-primary"/>
 </button>

 {/* 章节列表 */}
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-medium text-text-muted">章节列表</h3>
 <button onClick={handleAddChapter} className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors">
 <Plus className="w-3 h-3"/>
 新建
 </button>
 </div>

 {chapters.length === 0 ? (<EmptyState
              type="chapters"
              className="py-4"
              action={{
                label: '创建章节',
                onClick: handleAddChapter
              }}
            />) : (<div className="space-y-1 max-h-64 overflow-y-auto">
 {chapters.map((chapter, index) => (<div key={chapter.id} className={cn("group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors", activeChapterId === chapter.id
 ? "bg-bg-sidebar-hover border-l-2 border-primary"
 : "hover:bg-bg-sidebar-hover")} onClick={() => setActiveChapterId(chapter.id)}>
 <span className="text-xs text-text-muted w-6">{index + 1}</span>
 <span className={cn("flex-1 text-sm truncate", chapter.isCompleted ? "line-through text-text-muted" : "")}>
 {chapter.title}
 </span>
 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <button onClick={(e) => {
 e.stopPropagation();
 updateChapter(chapter.id, { isCompleted: !chapter.isCompleted });
 }} className={cn("p-1 rounded hover:bg-bg-tertiary", chapter.isCompleted ? "text-success" : "text-text-muted")}>
 <Eye className="w-3.5 h-3.5"/>
 </button>
 <button onClick={(e) => {
 e.stopPropagation();
 handleDeleteChapter(chapter.id);
 }} className="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-danger">
 <Trash2 className="w-3.5 h-3.5"/>
 </button>
 </div>
 </div>))}
 </div>)}
 </div>

 {/* 功能模块 */}
 <div className="space-y-2">
 <h3 className="text-sm font-medium text-text-muted">创作素材</h3>
 <button onClick={() => setShowSessionModal(true)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg-sidebar-hover transition-colors">
 <div className="flex items-center gap-3">
 <MessageSquare className="w-5 h-5 text-primary"/>
 <div className="text-left">
 <p className="text-sm font-medium">对话管理</p>
 <p className="text-xs text-text-muted mt-0.5">{sessionStore?.sessions?.length || 0} 个对话</p>
 </div>
 </div>
 </button>
 <button onClick={() => setShowCharacterModal(true)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg-sidebar-hover transition-colors">
 <div className="flex items-center gap-3">
 <UserCircle className="w-5 h-5 text-primary"/>
 <div className="text-left">
 <p className="text-sm font-medium">角色设定</p>
 <p className="text-xs text-text-muted mt-0.5">{characters.length} 个角色</p>
 </div>
 </div>
 </button>
 <button onClick={() => setShowWorldModal(true)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg-sidebar-hover transition-colors">
 <div className="flex items-center gap-3">
 <Globe className="w-5 h-5 text-primary"/>
 <div className="text-left">
 <p className="text-sm font-medium">世界观设定</p>
 <p className="text-xs text-text-muted mt-0.5">{worldSettings.length} 项设定</p>
 </div>
 </div>
 </button>
 <button onClick={() => setShowCorpusModal(true)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg-sidebar-hover transition-colors">
 <div className="flex items-center gap-3">
 <Database className="w-5 h-5 text-primary"/>
 <div className="text-left">
 <p className="text-sm font-medium">语料库</p>
 <p className="text-xs text-text-muted mt-0.5">{corpus.length} 条语料</p>
 </div>
 </div>
 </button>
 <button onClick={() => setShowTemplateModal(true)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-bg-sidebar-hover transition-colors">
 <div className="flex items-center gap-3">
 <FileText className="w-5 h-5 text-primary"/>
 <div className="text-left">
 <p className="text-sm font-medium">模板管理</p>
 <p className="text-xs text-text-muted mt-0.5">{templates.length} 个模板</p>
 </div>
 </div>
 </button>
 </div>
 </div>
 </div>

 <div className="p-4 border-t border-border-dark space-y-2">
 <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-sidebar-hover transition-colors">
 <Settings className="w-4 h-4"/>
 <span className="text-sm">设置</span>
 </button>
 <button onClick={() => setShowBackupModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-sidebar-hover transition-colors">
 <Save className="w-4 h-4"/>
 <span className="text-sm">备份</span>
 </button>
 <button onClick={() => setShowExportModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-sidebar-hover transition-colors">
 <Download className="w-4 h-4"/>
 <span className="text-sm">导出</span>
 </button>
 <button onClick={() => setShowLoginModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-sidebar-hover transition-colors">
 <User className="w-4 h-4"/>
 <span className="text-sm">账号</span>
 </button>
 </div>
 </div>

 <button onClick={() => setSidebarOpen(true)} className={cn("fixed left-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-bg-sidebar border-r border-border-dark rounded-r-lg hover:bg-bg-sidebar-hover transition-all", sidebarOpen && "opacity-0 pointer-events-none")}>
 <ChevronRight className="w-5 h-5 text-text-sidebar"/>
 </button>
 </>);
}
