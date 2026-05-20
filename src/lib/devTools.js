import { createContext, useContext, useCallback } from 'react'

const DevToolsContext = createContext(null)

const isDevelopment = process.env.NODE_ENV === 'development'

class Logger {
  constructor() {
    this.enabled = isDevelopment
    this.logs = []
    this.maxLogs = 100
  }

  log(level, category, message, data = null) {
    if (!this.enabled) return

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    }

    this.logs.unshift(logEntry)
    if (this.logs.length > this.maxLogs) {
      this.logs.pop()
    }

    const style = this.getStyle(level)
    const prefix = `[${category}]`
    
    if (data) {
      console[level](`%c${prefix} ${message}`, style, data)
    } else {
      console[level](`%c${prefix} ${message}`, style)
    }
  }

  getStyle(level) {
    const styles = {
      log: 'color: #4CAF50; font-weight: bold',
      info: 'color: #2196F3; font-weight: bold',
      warn: 'color: #FF9800; font-weight: bold',
      error: 'color: #F44336; font-weight: bold',
      debug: 'color: #9C27B0; font-weight: bold'
    }
    return styles[level] || styles.log
  }

  getLogs() {
    return this.logs
  }

  clear() {
    this.logs = []
    console.clear()
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }
}

const logger = new Logger()

export function DevToolsProvider({ children }) {
  const log = useCallback((category, message, data = null) => {
    logger.log('log', category, message, data)
  }, [])

  const info = useCallback((category, message, data = null) => {
    logger.log('info', category, message, data)
  }, [])

  const warn = useCallback((category, message, data = null) => {
    logger.log('warn', category, message, data)
  }, [])

  const error = useCallback((category, message, data = null) => {
    logger.log('error', category, message, data)
  }, [])

  const debug = useCallback((category, message, data = null) => {
    logger.log('debug', category, message, data)
  }, [])

  const clearLogs = useCallback(() => {
    logger.clear()
  }, [])

  const getLogs = useCallback(() => {
    return logger.getLogs()
  }, [])

  return (
    <DevToolsContext.Provider value={{
      log,
      info,
      warn,
      error,
      debug,
      clearLogs,
      getLogs,
      enabled: isDevelopment
    }}>
      {children}
    </DevToolsContext.Provider>
  )
}

export function useDevTools() {
  const context = useContext(DevToolsContext)
  if (!context) {
    return {
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      clearLogs: () => {},
      getLogs: () => [],
      enabled: false
    }
  }
  return context
}

export const performanceMonitor = {
  marks: new Map(),

  startMark(name) {
    if (!isDevelopment) return
    this.marks.set(name, performance.now())
  },

  endMark(name) {
    if (!isDevelopment) return 0
    const start = this.marks.get(name)
    if (!start) {
      console.warn(`[Performance] Mark "${name}" not found`)
      return 0
    }
    const duration = performance.now() - start
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    this.marks.delete(name)
    return duration
  },

  measure(name, fn) {
    if (!isDevelopment) return fn()
    this.startMark(name)
    const result = fn()
    this.endMark(name)
    return result
  },

  async measureAsync(name, fn) {
    if (!isDevelopment) return await fn()
    this.startMark(name)
    const result = await fn()
    this.endMark(name)
    return result
  }
}

export function createComponentLogger(componentName) {
  return {
    log: (message, data) => logger.log('log', componentName, message, data),
    info: (message, data) => logger.log('info', componentName, message, data),
    warn: (message, data) => logger.log('warn', componentName, message, data),
    error: (message, data) => logger.log('error', componentName, message, data),
    debug: (message, data) => logger.log('debug', componentName, message, data)
  }
}

export default DevToolsProvider
