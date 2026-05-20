import { useState, useRef, useEffect } from 'react'
import { Users, Heart, Zap, Skull, UserPlus, UserMinus, Edit3, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

const RELATION_TYPES = [
  { id: 'friend', name: '朋友', icon: Heart, color: '#10b981', description: '友谊关系' },
  { id: 'enemy', name: '敌人', icon: Skull, color: '#ef4444', description: '敌对关系' },
  { id: 'love', name: '恋人', icon: Heart, color: '#ec4899', description: '爱情关系' },
  { id: 'family', name: '家人', icon: Users, color: '#f59e0b', description: '亲属关系' },
  { id: 'mentor', name: '导师', icon: UserPlus, color: '#3b82f6', description: '师徒关系' },
  { id: 'rival', name: '对手', icon: Zap, color: '#8b5cf6', description: '竞争关系' }
]

export default function CharacterRelationsGraph() {
  const { characters, setCharacters } = useAppStore()
  const canvasRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [isAddingRelation, setIsAddingRelation] = useState(false)
  const [relationStart, setRelationStart] = useState(null)
  const [showRelationDialog, setShowRelationDialog] = useState(false)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  // 初始化角色节点
  useEffect(() => {
    const newNodes = characters.map((char, index) => {
      const angle = (index / characters.length) * 2 * Math.PI - Math.PI / 2
      const radius = 150
      return {
        id: char.id,
        name: char.name,
        avatar: char.avatar || 'default',
        role: char.role || 'supporting',
        x: 250 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
        fx: null,
        fy: null
      }
    })
    
    setNodes(newNodes)
    setEdges(characters.length > 0 && characters[0].relations ? 
      characters[0].relations : [])
  }, [characters])

  // 简易力导向布局模拟
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let tickCount = 0

    const simulate = () => {
      tickCount++
      
      // 复制节点
      const newNodes = [...nodes]

      // 节点间斥力
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[i].x - newNodes[j].x
          const dy = newNodes[i].y - newNodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 1000 / (dist * dist)

          newNodes[i].vx += (dx / dist) * force
          newNodes[i].vy += (dy / dist) * force
          newNodes[j].vx -= (dx / dist) * force
          newNodes[j].vy -= (dy / dist) * force
        }
      }

      // 节点到中心的引力
      for (const node of newNodes) {
        const dx = 250 - node.x
        const dy = 200 - node.y
        node.vx += dx * 0.01
        node.vy += dy * 0.01
      }

      // 更新位置
      for (const node of newNodes) {
        if (!node.fx) node.x += node.vx
        if (!node.fy) node.y += node.vy
        node.vx *= 0.9
        node.vy *= 0.9
      }

      // 绘制
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制关系连线
      edges.forEach(edge => {
        const source = newNodes.find(n => n.id === edge.source)
        const target = newNodes.find(n => n.id === edge.target)
        if (!source || !target) return

        const relationType = RELATION_TYPES.find(r => r.id === edge.type)
        const color = relationType?.color || '#9ca3af'

        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.setLineDash(edge.type === 'rival' ? [5, 5] : [])
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke()
      })

      // 绘制节点
      newNodes.forEach((node, index) => {
        const roleColors = {
          main: '#3b82f6',
          secondary: '#8b5cf6',
          supporting: '#6b7280',
          antagonist: '#ef4444'
        }
        const color = roleColors[node.role] || '#6b7280'

        // 节点阴影
        ctx.beginPath()
        ctx.arc(node.x, node.y, 32, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,0,0,0.1)'
        ctx.fill()

        // 节点外圈
        ctx.beginPath()
        ctx.arc(node.x, node.y, 28, 0, Math.PI * 2)
        ctx.fillStyle = selectedNode?.id === node.id ? '#1e40af' : color
        ctx.fill()

        // 节点内圈
        ctx.beginPath()
        ctx.arc(node.x, node.y, 22, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()

        // 节点文字
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.name.substring(0, 4), node.x, node.y)
        if (node.name.length > 4) {
          ctx.fillText(node.name.substring(4, 8), node.x, node.y + 15)
        }
      })

      if (tickCount < 100) {
        animationId = requestAnimationFrame(simulate)
      } else {
        setNodes(newNodes)
      }
    }

    simulate()

    return () => cancelAnimationFrame(animationId)
  }, [nodes, edges, selectedNode])

  // 处理节点点击
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let hitNode = null
    for (const node of nodes) {
      const dx = x - node.x
      const dy = y - node.y
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        hitNode = node
        break
      }
    }

    if (isAddingRelation && relationStart && hitNode && hitNode.id !== relationStart.id) {
      // 添加关系
      setShowRelationDialog(true)
    } else {
      setSelectedNode(hitNode)
      setIsAddingRelation(false)
      setRelationStart(null)
    }
  }

  const addRelation = (type) => {
    if (!relationStart || !selectedNode) return

    const newEdge = {
      id: `${relationStart.id}-${selectedNode.id}`,
      source: relationStart.id,
      target: selectedNode.id,
      type
    }

    setEdges(prev => [...prev.filter(e => e.id !== newEdge.id && e.id !== `${selectedNode.id}-${relationStart.id}`), newEdge])
    
    setShowRelationDialog(false)
    setIsAddingRelation(false)
    setRelationStart(null)
  }

  const startAddingRelation = () => {
    if (!selectedNode) return
    setIsAddingRelation(true)
    setRelationStart(selectedNode)
  }

  const removeSelectedRelation = () => {
    if (!selectedNode) return
    setEdges(prev => prev.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
  }

  const selectedCharacter = characters.find(c => c.id === selectedNode?.id)
  const selectedRelations = edges.filter(e => e.source === selectedNode?.id || e.target === selectedNode?.id)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">角色关系图谱</h3>
        </div>
        <div className="flex items-center gap-2">
          {!isAddingRelation ? (
            <button
              onClick={startAddingRelation}
              disabled={!selectedNode}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-sm rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <UserPlus className="w-4 h-4" />
              添加关系
            </button>
          ) : (
            <button
              onClick={() => {
                setIsAddingRelation(false)
                setRelationStart(null)
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-border text-text-primary text-sm rounded hover:bg-border/80 transition"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 画布区域 */}
        <div className="flex-1 relative bg-bg-secondary">
          <canvas
            ref={canvasRef}
            width={500}
            height={400}
            onClick={handleCanvasClick}
            className="absolute inset-0 w-full h-full cursor-crosshair"
          />
          
          {isAddingRelation && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1.5 rounded text-sm">
              选择另一个角色建立关系
            </div>
          )}
        </div>

        {/* 右侧信息 */}
        <div className="w-64 p-4 border-l border-border overflow-y-auto">
          {/* 图例 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-text-primary mb-3">关系类型</h4>
            <div className="space-y-2">
              {RELATION_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <div key={type.id} className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                    <span>{type.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 选中角色信息 */}
          {selectedCharacter && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">选中角色</h4>
                <p className="text-lg font-medium text-text-primary">{selectedCharacter.name}</p>
                <p className="text-sm text-text-muted">{selectedCharacter.role === 'main' ? '主角' : selectedCharacter.role === 'antagonist' ? '反派' : '配角'}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-text-primary">关系列表</h4>
                  {selectedRelations.length > 0 && (
                    <button
                      onClick={removeSelectedRelation}
                      className="text-xs text-danger hover:text-danger/80"
                    >
                      清除
                    </button>
                  )}
                </div>
                {selectedRelations.length === 0 ? (
                  <p className="text-sm text-text-muted">暂无关系</p>
                ) : (
                  <div className="space-y-2">
                    {selectedRelations.map(rel => {
                      const otherId = rel.source === selectedNode.id ? rel.target : rel.source
                      const otherChar = characters.find(c => c.id === otherId)
                      const relationType = RELATION_TYPES.find(r => r.id === rel.type)
                      const Icon = relationType?.icon || Users

                      return (
                        <div key={rel.id} className="flex items-center gap-2 p-2 bg-bg-primary rounded text-sm">
                          <Icon className="w-4 h-4" style={{ color: relationType?.color }} />
                          <span className="text-text-secondary">{relationType?.name || '关系'}</span>
                          <span className="text-text-primary">→</span>
                          <span className="text-text-primary font-medium">{otherChar?.name || '未知'}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedCharacter && (
            <p className="text-sm text-text-muted">点击节点选择角色</p>
          )}
        </div>
      </div>

      {/* 添加关系对话框 */}
      {showRelationDialog && relationStart && selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRelationDialog(false)}>
          <div className="bg-bg-secondary rounded-lg p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              建立关系
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {characters.find(c => c.id === relationStart.id)?.name} 和 {characters.find(c => c.id === selectedNode.id)?.name} 是什么关系？
            </p>
            <div className="grid grid-cols-2 gap-3">
              {RELATION_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => addRelation(type.id)}
                    className="flex items-center gap-2 p-3 border border-border rounded hover:bg-bg-primary transition"
                  >
                    <Icon className="w-5 h-5" style={{ color: type.color }} />
                    <span className="text-sm text-text-primary">{type.name}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowRelationDialog(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
