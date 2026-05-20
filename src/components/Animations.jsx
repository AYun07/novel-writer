import { useState, useEffect, useRef } from 'react'
import { cn } from '../lib/utils'

export function FadeIn({ 
  children, 
  duration = 300, 
  delay = 0, 
  direction = 'up',
  className,
  as: Component = 'div'
}) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])

  const directionClasses = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: '-translate-x-4',
    right: 'translate-x-4',
    scale: 'scale-95',
    none: ''
  }

  return (
    <Component
      className={cn(
        "transition-all ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        isVisible ? "translate-y-0 translate-x-0 scale-100" : directionClasses[direction],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </Component>
  )
}

export function SlideIn({ 
  children, 
  direction = 'right', 
  duration = 300, 
  className,
  as: Component = 'div' 
}) {
  const directionStyles = {
    right: 'translate-x-full',
    left: '-translate-x-full',
    up: 'translate-y-full',
    down: '-translate-y-full'
  }

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <Component
      className={cn(
        "transition-transform ease-out",
        isVisible ? "translate-x-0 translate-y-0" : directionStyles[direction],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </Component>
  )
}

export function ScaleIn({ 
  children, 
  duration = 200, 
  className,
  as: Component = 'div' 
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <Component
      className={cn(
        "transition-all ease-out origin-center",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </Component>
  )
}

export function StaggeredList({ 
  children, 
  delay = 100, 
  direction = 'up',
  className 
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <FadeIn 
            key={index} 
            delay={delay * index}
            direction={direction}
          >
            {child}
          </FadeIn>
        ))
      ) : (
        children
      )}
    </div>
  )
}

export function HoverScale({ 
  children, 
  scale = 1.05, 
  duration = 200,
  className 
}) {
  return (
    <div
      className={cn(
        "transition-transform ease-out cursor-pointer",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(${scale})`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {children}
    </div>
  )
}

export function SkeletonPulse({ 
  children, 
  className,
  enable = true 
}) {
  if (!enable) return children

  return (
    <div className={cn("animate-pulse", className)}>
      {children}
    </div>
  )
}

export function AnimateOnScroll({ 
  children, 
  threshold = 0.1,
  className 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </div>
  )
}

export function Typewriter({ 
  text, 
  speed = 50, 
  onComplete,
  className 
}) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <span className={className}>
      {displayText}
    </span>
  )
}
