import { memo, type ReactNode } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export type ServiceNodeData = {
  label: string
  icon: ReactNode
  color: string
  description?: string
  health?: 'healthy' | 'unhealthy' | 'unknown'
  handles?: {
    top?: boolean
    bottom?: boolean
    left?: boolean
    right?: boolean
  }
}

export const ServiceNode = memo(({ data }: NodeProps) => {
  const { label, icon, color, description, health, handles } = data as unknown as ServiceNodeData

  const healthColor = health === 'healthy' ? '#22c55e' : health === 'unhealthy' ? '#ef4444' : '#94a3b8'

  return (
    <div className="service-node" style={{ borderColor: color }}>
      {handles?.top !== false && (
        <Handle type="target" position={Position.Top} className="handle" style={{ background: color }} />
      )}
      {handles?.left && (
        <Handle type="target" position={Position.Left} id="left" className="handle" style={{ background: color }} />
      )}

      <div className="service-node-header">
        <div className="service-node-icon" style={{ color }}>{icon}</div>
        <div className="service-node-label">{label}</div>
        {health && (
          <div
            className="service-node-health"
            style={{ background: healthColor, boxShadow: `0 0 6px ${healthColor}80` }}
          />
        )}
      </div>
      {description && <div className="service-node-desc">{description}</div>}

      {handles?.bottom !== false && (
        <Handle type="source" position={Position.Bottom} className="handle" style={{ background: color }} />
      )}
      {handles?.right && (
        <Handle type="source" position={Position.Right} id="right" className="handle" style={{ background: color }} />
      )}
    </div>
  )
})
