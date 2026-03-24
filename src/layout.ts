import Dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'

export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL'

const NODE_DEFAULTS: Record<string, { width: number; height: number }> = {
  pipelineStage: { width: 220, height: 100 },
  environment: { width: 240, height: 130 },
  traffic: { width: 240, height: 120 },
  service: { width: 180, height: 80 },
  info: { width: 240, height: 100 },
  group: { width: 0, height: 0 },
}

const GROUP_PADDING = { top: 55, right: 30, bottom: 30, left: 30 }
const NODE_SEP = 80
const RANK_SEP = 120

export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection,
): { nodes: Node[]; edges: Edge[] } {
  const groups = nodes.filter((n) => n.type === 'group')
  const contentNodes = nodes.filter((n) => n.type !== 'group')

  const parentMap = new Map<string, string>()
  for (const n of contentNodes) {
    if (n.parentId) parentMap.set(n.id, n.parentId)
  }

  const g = new Dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
    marginx: 40,
    marginy: 40,
  })

  for (const node of contentNodes) {
    const dims = NODE_DEFAULTS[node.type ?? 'pipelineStage'] ?? NODE_DEFAULTS.pipelineStage
    g.setNode(node.id, { width: dims.width, height: dims.height })
  }

  for (const edge of edges) {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target)
    }
  }

  Dagre.layout(g)

  const absolutePositions = new Map<string, { x: number; y: number; w: number; h: number }>()
  for (const node of contentNodes) {
    const pos = g.node(node.id)
    const dims = NODE_DEFAULTS[node.type ?? 'pipelineStage'] ?? NODE_DEFAULTS.pipelineStage
    absolutePositions.set(node.id, {
      x: pos.x - dims.width / 2,
      y: pos.y - dims.height / 2,
      w: dims.width,
      h: dims.height,
    })
  }

  const groupChildren = new Map<string, string[]>()
  for (const [childId, groupId] of parentMap) {
    if (!groupChildren.has(groupId)) groupChildren.set(groupId, [])
    groupChildren.get(groupId)!.push(childId)
  }

  const groupBounds = new Map<string, { x: number; y: number; width: number; height: number }>()
  for (const group of groups) {
    const children = groupChildren.get(group.id) ?? []
    if (children.length === 0) continue

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const childId of children) {
      const pos = absolutePositions.get(childId)!
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x + pos.w)
      maxY = Math.max(maxY, pos.y + pos.h)
    }

    groupBounds.set(group.id, {
      x: minX - GROUP_PADDING.left,
      y: minY - GROUP_PADDING.top,
      width: maxX - minX + GROUP_PADDING.left + GROUP_PADDING.right,
      height: maxY - minY + GROUP_PADDING.top + GROUP_PADDING.bottom,
    })
  }

  const layoutedNodes: Node[] = []

  for (const group of groups) {
    const bounds = groupBounds.get(group.id)
    if (!bounds) {
      layoutedNodes.push(group)
      continue
    }
    layoutedNodes.push({
      ...group,
      position: { x: bounds.x, y: bounds.y },
      style: { ...group.style, width: bounds.width, height: bounds.height },
      data: { ...group.data, width: bounds.width, height: bounds.height },
    })
  }

  for (const node of contentNodes) {
    const abs = absolutePositions.get(node.id)!
    const groupId = parentMap.get(node.id)

    if (groupId && groupBounds.has(groupId)) {
      const gb = groupBounds.get(groupId)!
      layoutedNodes.push({
        ...node,
        position: { x: abs.x - gb.x, y: abs.y - gb.y },
      })
    } else {
      layoutedNodes.push({
        ...node,
        position: { x: abs.x, y: abs.y },
      })
    }
  }

  return { nodes: layoutedNodes, edges }
}
