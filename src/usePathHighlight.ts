import { useCallback, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'

interface PathHighlight {
  nodeIds: Set<string>
  edgeIds: Set<string>
  active: boolean
}

function buildPath(selectedId: string, edges: Edge[]): PathHighlight {
  const nodeIds = new Set<string>([selectedId])
  const edgeIds = new Set<string>()

  const downstream = new Map<string, { edgeId: string; target: string }[]>()
  const upstream = new Map<string, { edgeId: string; source: string }[]>()

  for (const e of edges) {
    if (!downstream.has(e.source)) downstream.set(e.source, [])
    downstream.get(e.source)!.push({ edgeId: e.id, target: e.target })
    if (!upstream.has(e.target)) upstream.set(e.target, [])
    upstream.get(e.target)!.push({ edgeId: e.id, source: e.source })
  }

  const walkDown = (id: string) => {
    for (const link of downstream.get(id) ?? []) {
      if (!edgeIds.has(link.edgeId)) {
        edgeIds.add(link.edgeId)
        nodeIds.add(link.target)
        walkDown(link.target)
      }
    }
  }

  const walkUp = (id: string) => {
    for (const link of upstream.get(id) ?? []) {
      if (!edgeIds.has(link.edgeId)) {
        edgeIds.add(link.edgeId)
        nodeIds.add(link.source)
        walkUp(link.source)
      }
    }
  }

  walkDown(selectedId)
  walkUp(selectedId)

  return { nodeIds, edgeIds, active: true }
}

export function usePathHighlight() {
  const [highlight, setHighlight] = useState<PathHighlight>({
    nodeIds: new Set(),
    edgeIds: new Set(),
    active: false,
  })

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node, edges: Edge[]) => {
    if (node.type === 'group') return
    setHighlight(buildPath(node.id, edges))
  }, [])

  const clearHighlight = useCallback(() => {
    setHighlight({ nodeIds: new Set(), edgeIds: new Set(), active: false })
  }, [])

  const applyHighlightClasses = useCallback(
    (nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } => {
      if (!highlight.active) {
        return {
          nodes: nodes.map((n) => ({
            ...n,
            className: n.className?.replace(/\b(path-node|path-dimmed)\b/g, '').trim() || undefined,
            data: { ...n.data, highlighted: undefined },
          })),
          edges: edges.map((e) => ({
            ...e,
            className: e.className?.replace(/\b(path-edge|path-dimmed)\b/g, '').trim() || undefined,
            data: { ...e.data, highlighted: undefined },
          })),
        }
      }

      return {
        nodes: nodes.map((n) => {
          const onPath = highlight.nodeIds.has(n.id)
          const cls = n.type === 'group' ? '' : onPath ? 'path-node' : 'path-dimmed'
          return { ...n, className: cls || undefined, data: { ...n.data, highlighted: onPath } }
        }),
        edges: edges.map((e) => {
          const onPath = highlight.edgeIds.has(e.id)
          return {
            ...e,
            className: onPath ? 'path-edge' : 'path-dimmed',
            data: { ...e.data, highlighted: onPath },
          }
        }),
      }
    },
    [highlight],
  )

  return { highlight, onNodeClick, clearHighlight, applyHighlightClasses }
}
