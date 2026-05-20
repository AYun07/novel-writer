import { useState, useEffect } from 'react'
import { X, Mail, Lock, User, Loader, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, resetPassword } from '../lib/firebase'
import { cn } from '../lib/utils'

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, user, setUser, setShowToast } = useAppStore()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    if (showLoginModal && user) {
      setMode('profile')
    }
  }, [showLoginModal, user])

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const user = await signInWithGoogle()
      setUser(user)
      setShowToast(`欢迎回来，${user.displayName || user.email}！`, 'success')
      setShowLoginModal(false)
    } catch (error) {
      setError('Google登录失败：' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      setError('请输入有效的邮箱地址')
      return
    }
    
    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const user = await signInWithEmail(email, password)
      setUser(user)
      setShowToast(`欢迎回来，${user.email}！`, 'success')
      setShowLoginModal(false)
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('用户不存在，请先注册')
        setMode('register')
      } else if (error.code === 'auth/wrong-password') {
        setError('密码错误')
      } else {
        setError('登录失败：' + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailRegister = async (e) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      setError('请输入有效的邮箱地址')
      return
    }
    
    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }
    
    if (!displayName.trim()) {
      setError('请输入昵称')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const user = await signUpWithEmail(email, password, displayName)
      setUser(user)
      setShowToast(`注册成功，欢迎 ${displayName}！`, 'success')
      setShowLoginModal(false)
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('该邮箱已被注册，请直接登录')
        setMode('login')
      } else {
        setError('注册失败：' + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      setError('请输入有效的邮箱地址')
      return
    }
    
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      await resetPassword(email)
      setSuccess('密码重置链接已发送到您的邮箱')
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('该邮箱未注册')
      } else {
        setError('重置密码失败：' + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('确定要退出登录吗？')) return
    
    setIsLoading(true)
    try {
      await signOutUser()
      setUser(null)
      setShowToast('已退出登录', 'info')
      setShowLoginModal(false)
    } catch (error) {
      setError('退出登录失败：' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  if (!showLoginModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowLoginModal(false)} />
      
      <div className="relative bg-bg-primary rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {mode === 'login' && '登录账号'}
            {mode === 'register' && '注册账号'}
            {mode === 'reset' && '重置密码'}
            {mode === 'profile' && '账号信息'}
          </h2>
          <button 
            onClick={() => setShowLoginModal(false)}
            className="p-2 hover:bg-bg-tertiary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 用户已登录视图 */}
          {mode === 'profile' && user && (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'}
                    className="w-24 h-24 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                )}
                <h3 className="text-xl font-semibold">{user.displayName || user.email?.split('@')[0]}</h3>
                <p className="text-sm text-text-muted">{user.email}</p>
                {user.metadata?.creationTime && (
                  <p className="text-xs text-text-muted mt-2">
                    注册时间：{new Date(user.metadata.creationTime).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-bg-secondary rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">云同步</span>
                    <span className="text-sm font-medium text-success flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      已启用
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full py-3 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                退出登录
              </button>
            </div>
          )}

          {/* 登录表单 */}
          {(mode === 'login' || mode === 'register') && (
            <>
              {/* Google登录按钮 */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 border border-border rounded-lg hover:bg-bg-secondary transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>使用 Google 登录</span>
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-bg-primary text-text-muted">或使用邮箱</span>
                </div>
              </div>

              {/* 邮箱登录表单 */}
              <form onSubmit={mode === 'login' ? handleEmailLogin : handleEmailRegister} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">昵称</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="输入昵称"
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="输入密码"
                      className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                      />
                      <span className="text-sm">记住邮箱</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-sm text-primary hover:underline"
                    >
                      忘记密码？
                    </button>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                  {mode === 'login' ? '登录' : '注册'}
                </button>
              </form>

              <div className="text-center">
                {mode === 'login' ? (
                  <p className="text-sm text-text-muted">
                    还没有账号？{' '}
                    <button
                      onClick={() => {
                        setMode('register')
                        setError('')
                      }}
                      className="text-primary hover:underline"
                    >
                      立即注册
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-text-muted">
                    已有账号？{' '}
                    <button
                      onClick={() => {
                        setMode('login')
                        setError('')
                      }}
                      className="text-primary hover:underline"
                    >
                      立即登录
                    </button>
                  </p>
                )}
              </div>
            </>
          )}

          {/* 重置密码表单 */}
          {mode === 'reset' && (
            <div className="space-y-6">
              <p className="text-sm text-text-muted">
                输入您的注册邮箱，我们将发送密码重置链接
              </p>

              <div>
                <label className="block text-sm font-medium mb-2">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                发送重置链接
              </button>

              <div className="text-center">
                <button
                  onClick={() => {
                    setMode('login')
                    setError('')
                    setSuccess('')
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  返回登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}