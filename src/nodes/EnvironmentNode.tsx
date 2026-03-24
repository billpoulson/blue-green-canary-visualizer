import { memo, type ReactNode } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export type EnvironmentNodeData = {
  label: string
  icon: ReactNode
  description?: string
  color: string
  version?: string
  status?: 'healthy' | 'unhealthy' | 'idle' | 'deploying'
  statusText?: string
  handles?: {
    top?: boolean
    bottom?: boolean
    left?: boolean
    right?: boolean
  }
}

export const EnvironmentNode = memo(({ data }: NodeProps) => {
  const { label, icon, description, color, version, status, statusText, handles } =
    data as unknown as EnvironmentNodeData

  return (
    <div className="env-node" style={{ borderColor: color }}>
      {handles?.top !== false && (
        <Handle type="target" position={Position.Top} className="handle" style={{ background: color }} />
      )}
      {handles?.left && (
        <Handle type="target" position={Position.Left} id="left" className="handle" style={{ background: color }} />
      )}

      <div className="env-node-header" style={{ background: `${color}18` }}>
        <div className="env-node-icon" style={{ color }}>{icon}</div>
        <div className="env-node-label">{label}</div>
        {version && (
          <span
            className="env-node-version"
            style={{ background: `${color}20`, color }}
          >
            {version}
          </span>
        )}
      </div>

      {description && (
        <div className="env-node-body">
          <p>{description}</p>
        </div>
      )}

      {status && (
        <div className="env-node-status">
          <span className={`env-node-status-dot ${status}`} />
          <span style={{ color: status === 'healthy' ? '#22c55e' : status === 'unhealthy' ? '#ef4444' : '#94a3b8' }}>
            {statusText ?? status}
          </span>
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
