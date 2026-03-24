import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export type InfoNodeData = {
  title: string
  text: string
  color: string
  badge?: string
  handles?: {
    top?: boolean
    bottom?: boolean
    left?: boolean
    right?: boolean
  }
}

export const InfoNode = memo(({ data }: NodeProps) => {
  const { title, text, color, badge, handles } = data as unknown as InfoNodeData

  return (
    <div className="info-node" style={{ borderColor: `${color}60` }}>
      {handles?.top !== false && (
        <Handle type="target" position={Position.Top} className="handle" style={{ background: color }} />
      )}
      {handles?.left && (
        <Handle type="target" position={Position.Left} id="left" className="handle" style={{ background: color }} />
      )}

      <div className="info-node-title" style={{ color }}>{title}</div>
      <div className="info-node-text">{text}</div>
      {badge && (
        <span className="info-node-badge" style={{ background: `${color}20`, color }}>
          {badge}
        </span>
      )}

      {handles?.bottom !== false && (
        <Handle type="source" position={Position.Bottom} className="handle" style={{ background: color }} />
      )}
      {handles?.right && (
        <Handle type="source" position={Position.Right} id="right" className="handle" style={{ background: color }} />
      )}
    </div>
  )
})
