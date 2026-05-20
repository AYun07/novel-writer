import { useState, useEffect } from 'react'
import { X, User, LogOut, Shield } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { signInWithGoogle, signOutUser, auth } from '../lib/firebase'
import { cn } from '../lib/utils'

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, setShowToast } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      setShowToast('登录成功！', 'success')
      setShowLoginModal(false)
    } catch (error) {
      setShowToast('登录失败：' + error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      setShowToast('已退出登录', 'info')
    } catch (error) {
      setShowToast('退出失败：' + error.message, 'error')
    }
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      showLoginModal ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowLoginModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">账号</h2>
          <button 
            onClick={() => setShowLoginModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-bg-secondary rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user.displayName || user.email}</p>
                  <p className="text-sm text-text-muted">{user.email}</p>
                </div>
              </div>

              <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                <p className="text-sm text-info">
                  <Shield className="w-4 h-4 inline mr-2" />
                  登录后可以使用云同步功能，实现多设备数据同步。
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">欢迎使用 Integrated Author</h3>
                <p className="text-sm text-text-muted">
                  登录账号以启用云同步功能
                </p>
              </div>

              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-bg-secondary transition-colors",
                  isLoading && "opacity-70"
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                )}
                {isLoading ? '登录中...' : '使用 Google 登录'}
              </button>

              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm text-warning">
                  提示：目前仅支持 Google 账号登录
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}