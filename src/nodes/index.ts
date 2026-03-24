import type { NodeTypes } from '@xyflow/react'
import { PipelineStageNode } from './PipelineStageNode'
import { EnvironmentNode } from './EnvironmentNode'
import { TrafficNode } from './TrafficNode'
import { ServiceNode } from './ServiceNode'
import { GroupNode } from './GroupNode'
import { InfoNode } from './InfoNode'

export const nodeTypes: NodeTypes = {
  pipelineStage: PipelineStageNode,
  environment: EnvironmentNode,
  traffic: TrafficNode,
  service: ServiceNode,
  group: GroupNode,
  info: InfoNode,
}

export type { PipelineStageNodeData } from './PipelineStageNode'
export type { EnvironmentNodeData } from './EnvironmentNode'
export type { TrafficNodeData } from './TrafficNode'
export type { ServiceNodeData } from './ServiceNode'
export type { GroupNodeData } from './GroupNode'
export type { InfoNodeData } from './InfoNode'
