import { Accessibility, Keyboard, Monitor, Volume2 } from 'lucide-react'
import { cn } from '../lib/utils'

export default function AccessibilityGuide({ isOpen, onClose }) {
  if (!isOpen) return null

  const features = [
    {
      icon: Keyboard,
      title: '键盘导航',
      description: '支持完整的键盘操作，无需鼠标即可使用所有功能',
      shortcuts: [
        { keys: ['Tab'], action: '在元素间移动' },
        { keys: ['Shift', 'Tab'], action: '反向移动' },
        { keys: ['Enter'], action: '激活按钮/链接' },
        { keys: ['Space'], action: '激活按钮' },
        { keys: ['Esc'], action: '关闭弹窗' }
      ]
    },
    {
      icon: Monitor,
      title: '屏幕阅读器支持',
      description: '为屏幕阅读器优化，正确朗读所有内容',
      features: [
        '使用语义化HTML标签',
        '所有图片包含alt文本',
        '表单元素正确关联标签',
        '动态内容变化会被朗读'
      ]
    },
    {
      icon: Volume2,
      title: '视觉优化',
      description: '高对比度和清晰的可视化设计',
      features: [
        '足够的颜色对比度',
        '文字大小可调整',
        '焦点状态清晰可见',
        '动画可被减少或禁用'
      ]
    }
  ]

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-guide-title"
    >
      <div 
        className="bg-bg-secondary rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Accessibility className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 id="accessibility-guide-title" className="text-xl font-bold text-text-primary">
                无障碍访问指南
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                为所有用户提供友好的使用体验
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="space-y-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="bg-bg-primary rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {feature.shortcuts && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-medium text-text-primary">快捷键</h4>
                      {feature.shortcuts.map((shortcut, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <span className="text-sm text-text-secondary">
                            {shortcut.action}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, kIdx) => (
                              <span key={kIdx}>
                                <kbd className="px-2 py-1 text-xs font-mono bg-bg-secondary border border-border rounded shadow-sm">
                                  {key}
                                </kbd>
                                {kIdx < shortcut.keys.length - 1 && (
                                  <span className="text-text-muted mx-1">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.features && (
                    <ul className="space-y-2 mt-4">
                      {feature.features.map((item, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <h4 className="text-sm font-semibold text-accent mb-2">
              💡 需要帮助？
            </h4>
            <p className="text-sm text-accent/80">
              如果您在访问过程中遇到任何问题，请联系开发者获取帮助。
              我们致力于让每个人都能轻松使用这个工具。
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
