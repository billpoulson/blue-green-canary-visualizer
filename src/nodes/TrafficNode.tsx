import { memo, type ReactNode } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export type TrafficSplit = {
  name: string
  percentage: number
  color: string
}

export type TrafficNodeData = {
  label: string
  icon: ReactNode
  color: string
  splits?: TrafficSplit[]
  handles?: {
    top?: boolean
    bottom?: boolean
    left?: boolean
    right?: boolean
  }
}

export const TrafficNode = memo(({ data }: NodeProps) => {
  const { label, icon, color, splits, handles } = data as unknown as TrafficNodeData

  return (
    <div className="traffic-node" style={{ borderColor: color }}>
      {handles?.top !== false && (
        <Handle type="target" position={Position.Top} className="handle" style={{ background: color }} />
      )}
      {handles?.left && (
        <Handle type="target" position={Position.Left} id="left" className="handle" style={{ background: color }} />
      )}

      <div className="traffic-node-header" style={{ background: `${color}18` }}>
        <div className="traffic-node-icon" style={{ color }}>{icon}</div>
        <div className="traffic-node-label">{label}</div>
      </div>

      {splits && splits.length > 0 && (
        <div className="traffic-node-body">
          <div className="traffic-split">
            {splits.map((s) => (
              <div key={s.name} className="traffic-split-row">
                <span className="traffic-split-name" style={{ color: s.color }}>{s.name}</span>
                <div className="traffic-split-bar">
                  <div
                    className="traffic-split-fill"
                    style={{ width: `${s.percentage}%`, background: s.color }}
                  />
                </div>
                <span className="traffic-split-label" style={{ color: s.color }}>{s.percentage}%</span>
              </div>
            ))}
          </div>
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
