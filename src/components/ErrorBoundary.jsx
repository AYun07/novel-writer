import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })

    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-bg-secondary rounded-xl p-8 shadow-lg border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">
                    出了点问题
                  </h1>
                  <p className="text-sm text-text-secondary">
                    应用程序遇到了一个错误
                  </p>
                </div>
              </div>

              <div className="bg-bg-primary rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-text-primary mb-2">
                  错误信息
                </h3>
                <pre className="text-xs text-danger font-mono overflow-x-auto">
                  {this.state.error?.toString()}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <h3 className="text-sm font-medium text-text-primary mb-2 mt-4">
                      堆栈跟踪
                    </h3>
                    <pre className="text-xs text-text-secondary font-mono overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-accent mb-2">
                  💡 解决方案
                </h4>
                <ul className="text-sm text-accent/80 space-y-1">
                  <li>• 刷新页面重新加载应用</li>
                  <li>• 检查浏览器控制台获取更多信息</li>
                  <li>• 如果问题持续存在，请联系开发者</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新页面
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bg-primary text-text-primary rounded-lg hover:bg-bg-tertiary transition-colors font-medium border border-border"
                >
                  <Home className="w-4 h-4" />
                  返回首页
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-text-muted text-center">
                  版本: {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'} | 
                  时间: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export class AsyncErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary mb-4">
            {this.props.message || '加载失败'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
