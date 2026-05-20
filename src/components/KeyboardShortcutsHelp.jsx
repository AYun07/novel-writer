import { X, Keyboard } from 'lucide-react'
import { cn } from '../lib/utils'

export default function KeyboardShortcutsHelp({ 
  isOpen, 
  onClose, 
  shortcuts = [] 
}) {
  if (!isOpen) return null

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {})

  const categoryIcons = {
    '通用': '⚙️',
    '格式': '✏️',
    '视图': '👁️',
    '章节': '📑'
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div 
        className="bg-bg-secondary rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 id="keyboard-shortcuts-title" className="text-xl font-bold text-text-primary">
                  键盘快捷键
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  按下 Esc 键可关闭此面板
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-bg-primary/50 flex items-center justify-center transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid gap-6">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{categoryIcons[category] || '📌'}</span>
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                    {category}
                  </h3>
                </div>
                <div className="space-y-2">
                  {items.map((shortcut, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 bg-bg-primary/50 rounded-lg hover:bg-bg-primary transition-colors"
                    >
                      <span className="text-text-secondary text-sm">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx}>
                            <kbd className="px-2 py-1 text-xs font-mono bg-bg-secondary border border-border rounded shadow-sm">
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-text-secondary mx-1">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-accent font-medium">
              💡 提示：Mac 用户可将 'Ctrl' 替换为 '⌘' (Command) 键使用
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
