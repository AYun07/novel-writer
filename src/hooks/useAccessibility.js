import { useEffect, useRef, useCallback } from 'react'

export function useFocusManagement() {
  const focusableElements = useRef([])

  const getFocusableElements = useCallback((container) => {
    const focusSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'a[href]'
    ]

    return container.querySelectorAll(focusSelectors.join(', '))
  }, [])

  const trapFocus = useCallback((container) => {
    focusableElements.current = Array.from(getFocusableElements(container))
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return

      const firstElement = focusableElements.current[0]
      const lastElement = focusableElements.current[focusableElements.current.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [getFocusableElements])

  const focusFirstElement = useCallback((container) => {
    const elements = getFocusableElements(container)
    if (elements.length > 0) {
      elements[0].focus()
    }
  }, [getFocusableElements])

  const focusLastElement = useCallback((container) => {
    const elements = getFocusableElements(container)
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
    }
  }, [getFocusableElements])

  return {
    trapFocus,
    focusFirstElement,
    focusLastElement,
    getFocusableElements
  }
}

export function useAnnounce() {
  const announce = useCallback((message, priority = 'polite') => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.setAttribute('class', 'sr-only')
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `
    
    document.body.appendChild(announcer)
    
    setTimeout(() => {
      announcer.textContent = message
    }, 100)
    
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }, [])

  return announce
}

export function useKeyboardNavigation(items, options = {}) {
  const { 
    onSelect, 
    onChange,
    loop = true,
    orientation = 'vertical'
  } = options

  const handleKeyDown = useCallback((e, currentIndex) => {
    const itemsCount = items.length
    if (itemsCount === 0) return

    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        newIndex = orientation === 'vertical' 
          ? (currentIndex + 1) % itemsCount
          : currentIndex
        break
        
      case 'ArrowUp':
        e.preventDefault()
        newIndex = orientation === 'vertical'
          ? (currentIndex - 1 + itemsCount) % itemsCount
          : currentIndex
        break
        
      case 'ArrowRight':
        e.preventDefault()
        newIndex = orientation === 'horizontal'
          ? (currentIndex + 1) % itemsCount
          : currentIndex
        break
        
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = orientation === 'horizontal'
          ? (currentIndex - 1 + itemsCount) % itemsCount
          : currentIndex
        break
        
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
        
      case 'End':
        e.preventDefault()
        newIndex = itemsCount - 1
        break
        
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (onSelect) onSelect(items[currentIndex], currentIndex)
        return
        
      default:
        return
    }

    if (newIndex !== currentIndex) {
      if (onChange) onChange(newIndex)
    }
  }, [items, onSelect, onChange, orientation])

  return { handleKeyDown }
}

export function useRovingTabIndex(items, options = {}) {
  const { 
    onChange,
    initialIndex = 0 
  } = options

  const [activeIndex, setActiveIndex] = useState(initialIndex)

  const handleKeyDown = useCallback((e) => {
    let newIndex = activeIndex

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        newIndex = (activeIndex + 1) % items.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = (activeIndex - 1 + items.length) % items.length
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = items.length - 1
        break
      default:
        return
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)
      if (onChange) onChange(newIndex)
    }
  }, [activeIndex, items.length, onChange])

  const getTabIndex = useCallback((index) => {
    return index === activeIndex ? 0 : -1
  }, [activeIndex])

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getTabIndex
  }
}

import { useState } from 'react'

export function AccessibilityHelpers() {
  return null
}
