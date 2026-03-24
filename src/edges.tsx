import type { Edge, EdgeTypes } from '@xyflow/react'
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'

const LABEL_WIDTH = 220

function isHighlighted(props: EdgeProps): boolean {
  return (props.data as Record<string, unknown> | undefined)?.highlighted === true
}

function AnimatedEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, label } = props
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const lit = isHighlighted(props)

  const color = (style as React.CSSProperties | undefined)?.stroke ?? '#60a5fa'
  const dur = ((props.data as Record<string, unknown> | undefined)?.speed as string) ?? '3s'

  const edgeStyle = lit
    ? { ...style, strokeWidth: 3, filter: 'drop-shadow(0 0 6px currentColor)' }
    : style

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <circle r="3" fill={color as string} opacity={0.8}>
        <animateMotion dur={dur} repeatCount="indefinite" path={edgePath} />
      </circle>
      {label && (
        <foreignObject
          width={LABEL_WIDTH}
          height={36}
          x={labelX - LABEL_WIDTH / 2}
          y={labelY - 18}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className={`edge-label ${lit ? 'edge-label-lit' : ''}`}>{label}</div>
        </foreignObject>
      )}
    </>
  )
}

function SuccessEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, label } = props
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const lit = isHighlighted(props)

  const edgeStyle = lit
    ? { ...style, stroke: '#22c55e', strokeWidth: 3, filter: 'drop-shadow(0 0 6px #22c55e)' }
    : { ...style, stroke: '#22c55e' }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <circle r="3" fill="#22c55e" opacity={0.8}>
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
      </circle>
      {label && (
        <foreignObject
          width={LABEL_WIDTH}
          height={36}
          x={labelX - LABEL_WIDTH / 2}
          y={labelY - 18}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className={`edge-label edge-label-success ${lit ? 'edge-label-lit' : ''}`}>{label}</div>
        </foreignObject>
      )}
    </>
  )
}

function DeniedEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, label } = props
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const lit = isHighlighted(props)

  const edgeStyle = lit
    ? { ...style, strokeDasharray: '8 4', stroke: '#ef4444', strokeWidth: 3, filter: 'drop-shadow(0 0 6px #ef4444)' }
    : { ...style, strokeDasharray: '8 4', stroke: '#ef4444' }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      {label && (
        <foreignObject
          width={LABEL_WIDTH}
          height={36}
          x={labelX - LABEL_WIDTH / 2}
          y={labelY - 18}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className={`edge-label edge-label-denied ${lit ? 'edge-label-lit' : ''}`}>{label}</div>
        </foreignObject>
      )}
    </>
  )
}

export const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
  success: SuccessEdge,
  denied: DeniedEdge,
}

export type CustomEdge = Edge & { type: 'animated' | 'success' | 'denied' }
