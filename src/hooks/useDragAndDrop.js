import { useState, useCallback } from 'react'
import { cn } from '../lib/utils'

export function useDragAndDrop(items, onReorder) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback((e, index) => {
    setDraggedIndex(index)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }, [])

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (overIndex !== index) {
      setOverIndex(index)
    }
  }, [overIndex])

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setOverIndex(index)
    }
  }, [draggedIndex])

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOverIndex(null)
    }
  }, [])

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newItems = [...items]
      const [removed] = newItems.splice(draggedIndex, 1)
      newItems.splice(dropIndex, 0, removed)
      
      onReorder(newItems)
    }
    
    setDraggedIndex(null)
    setOverIndex(null)
    setIsDragging(false)
  }, [draggedIndex, items, onReorder])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setOverIndex(null)
    setIsDragging(false)
  }, [])

  const getItemProps = useCallback((index) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, index),
    onDragOver: (e) => handleDragOver(e, index),
    onDragEnter: (e) => handleDragEnter(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, index),
    onDragEnd: handleDragEnd
  }), [handleDragStart, handleDragOver, handleDragEnter, handleDragLeave, handleDrop, handleDragEnd])

  const getContainerProps = useCallback(() => ({
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault()
      if (draggedIndex !== null && overIndex === null) {
        handleDrop(e, items.length - 1)
      }
    }
  }), [draggedIndex, overIndex, items.length, handleDrop])

  return {
    draggedIndex,
    overIndex,
    isDragging,
    getItemProps,
    getContainerProps
  }
}

export function DraggableItem({ 
  children, 
  index, 
  isDragging,
  isOver,
  className,
  ghostClassName = 'opacity-50'
}) {
  return (
    <div
      className={cn(
        "transition-all duration-200",
        isDragging && ghostClassName,
        isOver && "border-t-2 border-primary",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DragHandle({ className }) {
  return (
    <div 
      className={cn(
        "cursor-grab active:cursor-grabbing p-1 hover:bg-bg-tertiary rounded transition-colors",
        className
      )}
      title="拖拽以重新排序"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="currentColor"
      >
        <circle cx="5" cy="4" r="1.5" />
        <circle cx="11" cy="4" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="11" cy="12" r="1.5" />
      </svg>
    </div>
  )
}

export default function useDragAndDrop
