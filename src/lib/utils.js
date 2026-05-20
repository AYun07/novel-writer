import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function debounce(func, wait) {
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

export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function formatRelativeTime(date) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSecs < 60) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  return `${Math.floor(diffDays / 365)}年前`
}

export function countWords(text) {
  if (!text) return 0
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = text.split(/\s+/).filter(w => w.length > 0).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars * 1 + englishWords * 1.3 + otherChars * 0.5)
}

export function stripHtml(html) {
  if (!html) return ''
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export function truncate(str, length = 50, suffix = '...') {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length - suffix.length) + suffix
}

export function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  }
  
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  return Promise.resolve()
}

export function parseMarkdown(text) {
  if (!text) return ''
  
  return text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />')
}

export function estimateReadingTime(text, wordsPerMinute = 400) {
  const wordCount = countWords(text)
  return Math.ceil(wordCount / wordsPerMinute)
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validateUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

export function unique(array, key = null) {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

export function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry(fn, retries = 3, delay = 1000) {
  return fn().catch(err => {
    if (retries <= 0) throw err
    return sleep(delay).then(() => retry(fn, retries - 1, delay * 2))
  })
}

export function isEmpty(value) {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

export function omit(obj, keys) {
  return Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

export function mergeDeep(target, source) {
  const output = { ...target }
  
  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach(key => {
      if (isPlainObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key]
        } else {
          output[key] = mergeDeep(target[key], source[key])
        }
      } else {
        output[key] = source[key]
      }
    })
  }
  
  return output
}

function isPlainObject(item) {
  return item && typeof item === 'object' && item.constructor === Object
}

export function getContrastColor(hexColor) {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

export function generateColorPalette(baseColor, count = 5) {
  const colors = [baseColor]
  const base = parseInt(baseColor.replace('#', ''), 16)
  const r = (base >> 16) & 255
  const g = (base >> 8) & 255
  const b = base & 255
  
  for (let i = 1; i < count; i++) {
    const factor = i / count
    const newR = Math.round(r + (255 - r) * factor)
    const newG = Math.round(g + (255 - g) * factor)
    const newB = Math.round(b + (255 - b) * factor)
    colors.push(`#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`)
  }
  
  return colors
}

export function detectLanguage(text) {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length
  
  if (chineseChars > englishChars * 2) return 'zh'
  if (englishChars > chineseChars * 2) return 'en'
  return 'mixed'
}

export function sanitizeFilename(filename) {
  return filename.replace(/[<>:"/\\|?*]/g, '-').trim()
}

export function parseQueryString(query) {
  const params = new URLSearchParams(query)
  const result = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

export function buildQueryString(params) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, value)
    }
  })
  return searchParams.toString()
}

export class LocalStorageManager {
  constructor(prefix = 'app') {
    this.prefix = prefix
  }
  
  getKey(key) {
    return `${this.prefix}-${key}`
  }
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.getKey(key))
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }
  
  set(key, value) {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value))
      return true
    } catch (error) {
      console.error('LocalStorage set error:', error)
      return false
    }
  }
  
  remove(key) {
    localStorage.removeItem(this.getKey(key))
  }
  
  clear() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

export const storage = new LocalStorageManager('integrated-author')

export class EventEmitter {
  constructor() {
    this.events = {}
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    return () => this.off(event, callback)
  }
  
  off(event, callback) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return
    this.events[event].forEach(callback => callback(...args))
  }
  
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }
}

export const eventBus = new EventEmitter()

export function log(type, message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    const styles = {
      info: 'color: blue',
      success: 'color: green',
      warning: 'color: orange',
      error: 'color: red'
    }
    console.log(`%c[${type.toUpperCase()}] ${message}`, styles[type] || '', data || '')
  }
}

export const logger = {
  info: (msg, data) => log('info', msg, data),
  success: (msg, data) => log('success', msg, data),
  warn: (msg, data) => log('warning', msg, data),
  error: (msg, data) => log('error', msg, data)
}