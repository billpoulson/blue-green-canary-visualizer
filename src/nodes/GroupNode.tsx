import { memo, type ReactNode } from 'react'
import { type NodeProps } from '@xyflow/react'

export type GroupNodeData = {
  label: string
  icon?: ReactNode
  color: string
  width: number
  height: number
}

export const GroupNode = memo(({ data }: NodeProps) => {
  const { label, icon, color, width, height } = data as unknown as GroupNodeData

  return (
    <div
      className="group-node"
      style={{
        width,
        height,
        borderColor: `${color}40`,
        background: `${color}08`,
      }}
    >
      <div className="group-node-header" style={{ color }}>
        {icon && <span className="group-node-icon">{icon}</span>}
        {label}
      </div>
    </div>
  )
})
