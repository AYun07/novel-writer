import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import CharacterCount from '@tiptap/extension-character-count'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect, useCallback, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Minus, 
  Undo, 
  Redo, 
  Highlighter, 
  Link2, 
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  FileText,
  CheckSquare,
  Hash,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '../lib/utils'

const DEBOUNCE_DELAY = 500

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default function Editor({ content, onChange, placeholder = '开始写作...' }) {
  const debouncedOnChangeRef = useRef(debounce(onChange, DEBOUNCE_DELAY))
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    return () => {
      if (debouncedOnChangeRef.current) {
        debouncedOnChangeRef.current = null
      }
    }
  }, [])

  const handleUpdate = useCallback(({ editor }) => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      return
    }
    
    const html = editor.getHTML()
    if (debouncedOnChangeRef.current) {
      debouncedOnChangeRef.current(html)
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({ 
        placeholder,
        emptyEditorClass: 'is-editor-empty'
      }),
      Highlight.configure({ multicolor: true }),
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer'
        }
      }),
      Image.configure({ 
        allowBase64: true,
        inline: false,
        HTMLAttributes: {
          class: 'max-w-full rounded-lg'
        }
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      CharacterCount,
      TaskList,
      TaskItem.configure({
        nested: true
      })
    ],
    content,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] prose-headings:text-text-primary prose-p:text-text-secondary'
      }
    },
    injectCSS: false
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      isInitialLoadRef.current = true
      editor.commands.setContent(content, false)
      isInitialLoadRef.current = false
    }
  }, [content, editor])

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('输入链接地址', previousUrl)
    
    if (url === null) return
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('输入图片地址')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const wordCount = editor.storage.characterCount?.words?.() || 0
  const charCount = editor.storage.characterCount?.characters?.() || 0
  const readingTime = Math.ceil(wordCount / 400)

  const [showFormatBar, setShowFormatBar] = useState(true)

  return (
    <div className="flex flex-col h-full">
      {showFormatBar && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-bg-secondary">
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-colors',
                !editor.can().undo() && 'opacity-30'
              )}
              title="撤销 (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-colors',
                !editor.can().redo() && 'opacity-30'
              )}
              title="重做 (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('bold') && 'bg-bg-tertiary text-primary'
              )}
              title="加粗 (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('italic') && 'bg-bg-tertiary text-primary'
              )}
              title="斜体 (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('underline') && 'bg-bg-tertiary text-primary'
              )}
              title="下划线 (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('strike') && 'bg-bg-tertiary text-primary'
              )}
              title="删除线"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('highlight') && 'bg-bg-tertiary text-primary'
              )}
              title="高亮"
            >
              <Highlighter className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('heading', { level: 1 }) && 'bg-bg-tertiary text-primary'
              )}
              title="标题1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('heading', { level: 2 }) && 'bg-bg-tertiary text-primary'
              )}
              title="标题2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('heading', { level: 3 }) && 'bg-bg-tertiary text-primary'
              )}
              title="标题3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('bulletList') && 'bg-bg-tertiary text-primary'
              )}
              title="无序列表"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('orderedList') && 'bg-bg-tertiary text-primary'
              )}
              title="有序列表"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('taskList') && 'bg-bg-tertiary text-primary'
              )}
              title="任务列表"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive({ textAlign: 'left' }) && 'bg-bg-tertiary text-primary'
              )}
              title="左对齐"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive({ textAlign: 'center' }) && 'bg-bg-tertiary text-primary'
              )}
              title="居中对齐"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive({ textAlign: 'right' }) && 'bg-bg-tertiary text-primary'
              )}
              title="右对齐"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive({ textAlign: 'justify' }) && 'bg-bg-tertiary text-primary'
              )}
              title="两端对齐"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('blockquote') && 'bg-bg-tertiary text-primary'
              )}
              title="引用"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('code') && 'bg-bg-tertiary text-primary'
              )}
              title="行内代码"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 rounded hover:bg-bg-tertiary transition-colors"
              title="分割线"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('codeBlock') && 'bg-bg-tertiary text-primary'
              )}
              title="代码块"
            >
              <Hash className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={setLink}
              className={cn(
                'p-2 rounded hover:bg-bg-tertiary transition-colors',
                editor.isActive('link') && 'bg-bg-tertiary text-primary'
              )}
              title="添加链接"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={addImage}
              className="p-2 rounded hover:bg-bg-tertiary transition-colors"
              title="添加图片"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setShowFormatBar(!showFormatBar)}
              className="p-2 rounded hover:bg-bg-tertiary transition-colors"
              title={showFormatBar ? '隐藏工具栏' : '显示工具栏'}
            >
              {showFormatBar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="hidden md:block"
        >
          <div className="flex items-center gap-1 p-2 bg-bg-sidebar rounded-lg shadow-lg border border-border-dark">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                'p-1.5 rounded hover:bg-bg-sidebar-hover transition-colors text-text-sidebar',
                editor.isActive('bold') && 'bg-bg-sidebar-hover text-primary'
              )}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                'p-1.5 rounded hover:bg-bg-sidebar-hover transition-colors text-text-sidebar',
                editor.isActive('italic') && 'bg-bg-sidebar-hover text-primary'
              )}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn(
                'p-1.5 rounded hover:bg-bg-sidebar-hover transition-colors text-text-sidebar',
                editor.isActive('underline') && 'bg-bg-sidebar-hover text-primary'
              )}
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={setLink}
              className={cn(
                'p-1.5 rounded hover:bg-bg-sidebar-hover transition-colors text-text-sidebar',
                editor.isActive('link') && 'bg-bg-sidebar-hover text-primary'
              )}
            >
              <Link2 className="w-4 h-4" />
            </button>
          </div>
        </BubbleMenu>
      )}

      <div className="flex-1 overflow-auto p-6 bg-bg-primary">
        <EditorContent editor={editor} className="min-h-full max-w-4xl mx-auto" />
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-bg-secondary text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            字数：{wordCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            字符：{charCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            预计阅读：{readingTime} 分钟
          </span>
        </div>
        <div className="flex items-center gap-4">
          {editor.isActive('bold') && <span className="text-primary">加粗</span>}
          {editor.isActive('italic') && <span className="text-primary">斜体</span>}
          {editor.isActive('heading', { level: 1 }) && <span className="text-primary">标题1</span>}
          {editor.isActive('heading', { level: 2 }) && <span className="text-primary">标题2</span>}
          {editor.isActive('heading', { level: 3 }) && <span className="text-primary">标题3</span>}
          {editor.isActive('bulletList') && <span className="text-primary">列表</span>}
          {editor.isActive('blockquote') && <span className="text-primary">引用</span>}
        </div>
      </div>
    </div>
  )
}

function useState(initialValue) {
  const [state, setState] = require('react').useState(initialValue)
  return [state, setState]
}