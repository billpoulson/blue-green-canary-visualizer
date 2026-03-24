import { memo, type ReactNode } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export type PipelineStageNodeData = {
  label: string
  icon: ReactNode
  description?: string
  color: string
  handles?: {
    top?: boolean
    bottom?: boolean
    left?: boolean
    right?: boolean
  }
}

export const PipelineStageNode = memo(({ data }: NodeProps) => {
  const { label, icon, description, color, handles } = data as unknown as PipelineStageNodeData

  return (
    <div className="pipeline-node" style={{ borderColor: color }}>
      {handles?.top !== false && (
        <Handle type="target" position={Position.Top} className="handle" style={{ background: color }} />
      )}
      {handles?.left && (
        <Handle type="target" position={Position.Left} id="left" className="handle" style={{ background: color }} />
      )}

      <div className="pipeline-node-header" style={{ background: `${color}18` }}>
        <div className="pipeline-node-icon" style={{ color }}>{icon}</div>
        <div className="pipeline-node-label">{label}</div>
      </div>
      {description && (
        <div className="pipeline-node-body">
          <p>{description}</p>
        </div>
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
