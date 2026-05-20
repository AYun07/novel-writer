import { User, Smile, Heart, Star, Zap, Moon, Sun, Cloud, Flower, Flame, Droplet, Mountain, Wind } from 'lucide-react'
import { cn } from '../lib/utils'

const avatarOptions = [
  { id: 'default', icon: User, color: 'bg-gray-500' },
  { id: 'smile', icon: Smile, color: 'bg-yellow-500' },
  { id: 'heart', icon: Heart, color: 'bg-red-500' },
  { id: 'star', icon: Star, color: 'bg-amber-500' },
  { id: 'zap', icon: Zap, color: 'bg-blue-500' },
  { id: 'moon', icon: Moon, color: 'bg-indigo-500' },
  { id: 'sun', icon: Sun, color: 'bg-orange-500' },
  { id: 'cloud', icon: Cloud, color: 'bg-cyan-500' },
  { id: 'flower', icon: Flower, color: 'bg-pink-500' },
  { id: 'fire', icon: Flame, color: 'bg-red-600' },
  { id: 'water', icon: Droplet, color: 'bg-blue-600' },
  { id: 'mountain', icon: Mountain, color: 'bg-stone-600' },
  { id: 'wind', icon: Wind, color: 'bg-teal-500' },
]

const backgroundColors = [
  'bg-gradient-to-br from-primary/20 to-accent/20',
  'bg-gradient-to-br from-secondary/20 to-primary/20',
  'bg-gradient-to-br from-accent/20 to-secondary/20',
  'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
  'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
  'bg-gradient-to-br from-pink-500/20 to-red-500/20',
  'bg-gradient-to-br from-green-500/20 to-teal-500/20',
  'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
]

export default function AvatarPicker({ value, onChange }) {
  const selectedAvatar = avatarOptions.find(a => a.id === value) || avatarOptions[0]
  const SelectedIcon = selectedAvatar.icon

  const handleSelect = (avatarId) => {
    onChange(avatarId)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          选择头像
        </label>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center",
            backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
          )}>
            <SelectedIcon className={cn("w-10 h-10", selectedAvatar.color.replace('bg-', 'text-'))} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary mb-2">
              当前选择: <span className="text-text-primary font-medium">{selectedAvatar.id}</span>
            </p>
            <p className="text-xs text-text-muted">
              从下方选择一个图标作为角色头像
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {avatarOptions.map((avatar) => {
          const Icon = avatar.icon
          const isSelected = value === avatar.id
          
          return (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.id)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                "hover:scale-110 hover:shadow-lg",
                isSelected 
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-bg-primary bg-bg-secondary" 
                  : "bg-bg-secondary hover:bg-bg-tertiary"
              )}
              title={avatar.id}
              aria-label={`选择头像: ${avatar.id}`}
            >
              <Icon className={cn("w-6 h-6", avatar.color.replace('bg-', 'text-'))} />
            </button>
          )
        })}
      </div>

      <div className="text-xs text-text-muted">
        💡 提示：点击上方图标选择不同的头像
      </div>
    </div>
  )
}
