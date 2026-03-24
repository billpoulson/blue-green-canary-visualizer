import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Globe,
  GitBranch,
  Hammer,
  TestTube2,
  Rocket,
  Activity,
  ArrowRightLeft,
  Server,
  Database,
  DatabaseZap,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeft,
  RotateCcw,
  Container,
  Gauge,
  Plus,
  RefreshCw,
  Minus,
  Table2,
} from 'lucide-react'
import { nodeTypes } from './nodes'
import { edgeTypes } from './edges'
import { applyLayout, type LayoutDirection } from './layout'
import { usePathHighlight } from './usePathHighlight'

const C = {
  blue: '#3b82f6',
  green: '#22c55e',
  canary: '#f59e0b',
  red: '#ef4444',
  purple: '#a78bfa',
  cyan: '#06b6d4',
  pink: '#ec4899',
  gray: '#64748b',
}

type Scenario = 'overview' | 'blue-green' | 'canary' | 'db-migrations' | 'rollback'

function getScenarioData(scenario: Scenario): { nodes: Node[]; edges: Edge[] } {
  switch (scenario) {
    case 'overview':
      return getOverviewData()
    case 'blue-green':
      return getBlueGreenData()
    case 'canary':
      return getCanaryData()
    case 'db-migrations':
      return getDbMigrationsData()
    case 'rollback':
      return getRollbackData()
  }
}

/* ────────────────────────────────────────────────────────────────────
   Scenario 1 — Overview: Deployment Strategies Compared
   ──────────────────────────────────────────────────────────────────── */
function getOverviewData(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: 'ci-pipeline',
      type: 'pipelineStage',
      position: { x: 360, y: 0 },
      data: {
        label: 'CI/CD Pipeline',
        icon: <GitBranch size={20} />,
        description: 'Build, test, and package application artifacts',
        color: C.purple,
        handles: { top: false },
      },
    },

    // Traditional
    {
      id: 'group-traditional',
      type: 'group',
      position: { x: 0, y: 160 },
      style: { width: 280, height: 380 },
      data: { label: 'Traditional', icon: <Server size={14} />, color: C.gray, width: 280, height: 380 },
    },
    {
      id: 'trad-deploy',
      type: 'pipelineStage',
      parentId: 'group-traditional',
      position: { x: 30, y: 50 },
      data: {
        label: 'Deploy In-Place',
        icon: <Rocket size={20} />,
        description: 'Stop old version, deploy new version on same servers',
        color: C.gray,
      },
    },
    {
      id: 'trad-downtime',
      type: 'info',
      parentId: 'group-traditional',
      position: { x: 30, y: 200 },
      data: {
        title: 'Downtime Window',
        text: 'Users experience outage during deployment. Rollback requires full redeploy.',
        color: C.red,
        badge: 'High Risk',
      },
    },

    // Blue/Green
    {
      id: 'group-bluegreen',
      type: 'group',
      position: { x: 320, y: 160 },
      style: { width: 280, height: 380 },
      data: { label: 'Blue / Green', icon: <ArrowRightLeft size={14} />, color: C.blue, width: 280, height: 380 },
    },
    {
      id: 'bg-deploy',
      type: 'environment',
      parentId: 'group-bluegreen',
      position: { x: 20, y: 50 },
      data: {
        label: 'Green Environment',
        icon: <Server size={20} />,
        description: 'Deploy new version to idle environment, validate, then swap traffic',
        color: C.green,
        version: 'v2.0',
        status: 'deploying' as const,
        statusText: 'Deploying',
      },
    },
    {
      id: 'bg-benefit',
      type: 'info',
      parentId: 'group-bluegreen',
      position: { x: 20, y: 240 },
      data: {
        title: 'Instant Swap',
        text: 'Zero downtime. Instant rollback by switching traffic back to Blue.',
        color: C.green,
        badge: 'Low Risk',
      },
    },

    // Canary
    {
      id: 'group-canary',
      type: 'group',
      position: { x: 640, y: 160 },
      style: { width: 280, height: 380 },
      data: { label: 'Canary', icon: <Gauge size={14} />, color: C.canary, width: 280, height: 380 },
    },
    {
      id: 'canary-deploy',
      type: 'traffic',
      parentId: 'group-canary',
      position: { x: 20, y: 50 },
      data: {
        label: 'Traffic Router',
        icon: <ArrowRightLeft size={20} />,
        color: C.canary,
        splits: [
          { name: 'Stable', percentage: 95, color: C.blue },
          { name: 'Canary', percentage: 5, color: C.canary },
        ],
      },
    },
    {
      id: 'canary-benefit',
      type: 'info',
      parentId: 'group-canary',
      position: { x: 20, y: 230 },
      data: {
        title: 'Gradual Rollout',
        text: 'Validate with real traffic on a small subset. Promote gradually or rollback instantly.',
        color: C.canary,
        badge: 'Lowest Risk',
      },
    },

    // Users
    {
      id: 'users',
      type: 'pipelineStage',
      position: { x: 360, y: 620 },
      data: {
        label: 'Production Users',
        icon: <Users size={20} />,
        description: 'End users sending requests to the application',
        color: C.cyan,
        handles: { bottom: false },
      },
    },
  ]

  const edges: Edge[] = [
    { id: 'ci-trad', source: 'ci-pipeline', target: 'trad-deploy', type: 'animated', style: { stroke: C.gray }, markerEnd: { type: MarkerType.ArrowClosed, color: C.gray } },
    { id: 'ci-bg', source: 'ci-pipeline', target: 'bg-deploy', type: 'animated', style: { stroke: C.blue }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },
    { id: 'ci-canary', source: 'ci-pipeline', target: 'canary-deploy', type: 'animated', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'trad-down', source: 'trad-downtime', target: 'users', type: 'denied', label: 'Downtime', markerEnd: { type: MarkerType.ArrowClosed, color: C.red } },
    { id: 'bg-users', source: 'bg-benefit', target: 'users', type: 'success', label: 'Zero Downtime', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'canary-users', source: 'canary-benefit', target: 'users', type: 'success', label: 'Gradual Shift', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
  ]

  return { nodes, edges }
}

/* ────────────────────────────────────────────────────────────────────
   Scenario 2 — Blue/Green Deployment Flow
   ──────────────────────────────────────────────────────────────────── */
function getBlueGreenData(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    // Pipeline stages
    {
      id: 'code-push',
      type: 'pipelineStage',
      position: { x: 350, y: 0 },
      data: { label: 'Code Push', icon: <GitBranch size={20} />, description: 'Developer pushes to main branch', color: C.purple, handles: { top: false } },
    },
    {
      id: 'build',
      type: 'pipelineStage',
      position: { x: 350, y: 130 },
      data: { label: 'Build & Test', icon: <Hammer size={20} />, description: 'Compile, unit tests, integration tests, package artifact', color: C.purple },
    },
    {
      id: 'deploy-green',
      type: 'pipelineStage',
      position: { x: 350, y: 260 },
      data: { label: 'Deploy to Green', icon: <Rocket size={20} />, description: 'Deploy new version to the idle (Green) environment', color: C.green },
    },
    {
      id: 'smoke-test',
      type: 'pipelineStage',
      position: { x: 350, y: 390 },
      data: { label: 'Smoke Tests', icon: <TestTube2 size={20} />, description: 'Validate health endpoints, run automated smoke suite', color: C.cyan },
    },

    // Load Balancer
    {
      id: 'lb',
      type: 'traffic',
      position: { x: 340, y: 540 },
      data: {
        label: 'Load Balancer',
        icon: <ArrowRightLeft size={20} />,
        color: C.cyan,
        splits: [
          { name: 'Blue', percentage: 100, color: C.blue },
          { name: 'Green', percentage: 0, color: C.green },
        ],
      },
    },

    // Blue Environment
    {
      id: 'group-blue',
      type: 'group',
      position: { x: 40, y: 700 },
      style: { width: 310, height: 260 },
      data: { label: 'Blue Environment (Live)', icon: <Server size={14} />, color: C.blue, width: 310, height: 260 },
    },
    {
      id: 'blue-app',
      type: 'environment',
      parentId: 'group-blue',
      position: { x: 35, y: 50 },
      data: { label: 'App Servers (Blue)', icon: <Container size={20} />, color: C.blue, version: 'v1.0', status: 'healthy' as const, statusText: 'Serving 100% traffic' },
    },

    // Green Environment
    {
      id: 'group-green',
      type: 'group',
      position: { x: 560, y: 700 },
      style: { width: 310, height: 260 },
      data: { label: 'Green Environment (Idle)', icon: <Server size={14} />, color: C.green, width: 310, height: 260 },
    },
    {
      id: 'green-app',
      type: 'environment',
      parentId: 'group-green',
      position: { x: 35, y: 50 },
      data: { label: 'App Servers (Green)', icon: <Container size={20} />, color: C.green, version: 'v2.0', status: 'deploying' as const, statusText: 'Receiving deployment' },
    },

    // Shared DB
    {
      id: 'database',
      type: 'service',
      position: { x: 380, y: 1040 },
      data: { label: 'Shared Database', icon: <Database size={18} />, color: C.purple, health: 'healthy' as const, description: 'Expand-Migrate-Contract: both v1 & v2 compatible schema' },
    },

    // EMC callout
    {
      id: 'emc-note',
      type: 'info',
      position: { x: 620, y: 1020 },
      data: {
        title: 'Expand-Migrate-Contract',
        text: 'EXPAND: add new columns before deploy. MIGRATE: backfill during smoke tests. CONTRACT: drop old columns after Blue decommission.',
        color: C.canary,
        badge: 'DB Migration Strategy',
        handles: { top: false, bottom: false },
      },
    },

    // Switch step
    {
      id: 'switch-traffic',
      type: 'pipelineStage',
      position: { x: 700, y: 540 },
      data: { label: 'Switch Traffic', icon: <ArrowRightLeft size={20} />, description: 'Atomically swap LB from Blue to Green', color: C.green, handles: { left: true, top: false } },
    },

    // Users
    {
      id: 'users',
      type: 'pipelineStage',
      position: { x: 80, y: 1040 },
      data: { label: 'Users', icon: <Users size={20} />, color: C.cyan, handles: { bottom: false, top: false, left: true } },
    },
  ]

  const edges: Edge[] = [
    { id: 'e-push-build', source: 'code-push', target: 'build', type: 'animated', style: { stroke: C.purple }, markerEnd: { type: MarkerType.ArrowClosed, color: C.purple } },
    { id: 'e-build-deploy', source: 'build', target: 'deploy-green', type: 'animated', style: { stroke: C.purple }, markerEnd: { type: MarkerType.ArrowClosed, color: C.purple } },
    { id: 'e-deploy-smoke', source: 'deploy-green', target: 'smoke-test', type: 'animated', style: { stroke: C.green }, markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-smoke-lb', source: 'smoke-test', target: 'lb', type: 'animated', label: 'Tests Pass', style: { stroke: C.cyan }, markerEnd: { type: MarkerType.ArrowClosed, color: C.cyan } },
    { id: 'e-lb-blue', source: 'lb', target: 'blue-app', type: 'animated', label: '100% Traffic', style: { stroke: C.blue }, data: { speed: '2s' }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },
    { id: 'e-deploy-green-app', source: 'deploy-green', target: 'green-app', type: 'animated', style: { stroke: C.green }, markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-blue-db', source: 'blue-app', target: 'database', type: 'animated', style: { stroke: C.blue }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },
    { id: 'e-green-db', source: 'green-app', target: 'database', type: 'animated', style: { stroke: C.green }, markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-db-emc', source: 'database', target: 'emc-note', type: 'animated', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'e-lb-switch', source: 'smoke-test', target: 'switch-traffic', type: 'success', label: 'Validated', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-switch-green', source: 'switch-traffic', target: 'green-app', type: 'success', label: 'Swap to Green', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-users-lb', source: 'users', target: 'lb', type: 'animated', label: 'Requests', style: { stroke: C.cyan }, markerEnd: { type: MarkerType.ArrowClosed, color: C.cyan } },
  ]

  return { nodes, edges }
}

/* ────────────────────────────────────────────────────────────────────
   Scenario 3 — Canary Deployment Flow
   ──────────────────────────────────────────────────────────────────── */
function getCanaryData(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    // Pipeline
    {
      id: 'code-push',
      type: 'pipelineStage',
      position: { x: 350, y: 0 },
      data: { label: 'Code Push', icon: <GitBranch size={20} />, description: 'Merge to release branch triggers pipeline', color: C.purple, handles: { top: false } },
    },
    {
      id: 'build',
      type: 'pipelineStage',
      position: { x: 350, y: 130 },
      data: { label: 'Build & Test', icon: <Hammer size={20} />, description: 'Compile, run full test suite, build container image', color: C.purple },
    },
    {
      id: 'deploy-canary',
      type: 'pipelineStage',
      position: { x: 350, y: 260 },
      data: { label: 'Deploy Canary', icon: <Rocket size={20} />, description: 'Deploy new version to canary instance(s)', color: C.canary },
    },

    // Load Balancer with traffic split
    {
      id: 'lb',
      type: 'traffic',
      position: { x: 340, y: 420 },
      data: {
        label: 'Traffic Router',
        icon: <ArrowRightLeft size={20} />,
        color: C.cyan,
        splits: [
          { name: 'Stable', percentage: 95, color: C.blue },
          { name: 'Canary', percentage: 5, color: C.canary },
        ],
      },
    },

    // Stable pool
    {
      id: 'group-stable',
      type: 'group',
      position: { x: 30, y: 600 },
      style: { width: 310, height: 260 },
      data: { label: 'Stable Pool', icon: <Server size={14} />, color: C.blue, width: 310, height: 260 },
    },
    {
      id: 'stable-svc',
      type: 'environment',
      parentId: 'group-stable',
      position: { x: 35, y: 50 },
      data: { label: 'Stable Instances', icon: <Container size={20} />, color: C.blue, version: 'v1.0', status: 'healthy' as const, statusText: 'Serving 95% traffic' },
    },

    // Canary pool
    {
      id: 'group-canary',
      type: 'group',
      position: { x: 570, y: 600 },
      style: { width: 310, height: 260 },
      data: { label: 'Canary Pool', icon: <Server size={14} />, color: C.canary, width: 310, height: 260 },
    },
    {
      id: 'canary-svc',
      type: 'environment',
      parentId: 'group-canary',
      position: { x: 35, y: 50 },
      data: { label: 'Canary Instance', icon: <Container size={20} />, color: C.canary, version: 'v2.0', status: 'deploying' as const, statusText: 'Serving 5% traffic' },
    },

    // Monitoring
    {
      id: 'monitoring',
      type: 'pipelineStage',
      position: { x: 670, y: 420 },
      data: { label: 'Monitoring & Metrics', icon: <Activity size={20} />, description: 'Compare error rates, latency, and business metrics between stable and canary', color: C.pink, handles: { top: false, left: true } },
    },

    // Promotion stages
    {
      id: 'promote-25',
      type: 'info',
      position: { x: 670, y: 170 },
      data: { title: 'Promote 25%', text: 'Metrics healthy: increase canary to 25% of traffic', color: C.canary, badge: '25% traffic', handles: { top: false, left: true } },
    },
    {
      id: 'promote-50',
      type: 'info',
      position: { x: 880, y: 270 },
      data: { title: 'Promote 50%', text: 'Continue validation. If healthy, shift to 50%', color: C.canary, badge: '50% traffic', handles: { left: true } },
    },
    {
      id: 'promote-100',
      type: 'info',
      position: { x: 880, y: 420 },
      data: { title: 'Full Rollout', text: 'All metrics pass. Promote canary to 100% and decommission old stable instances.', color: C.green, badge: '100% — Done', handles: { bottom: false } },
    },

    // Database
    {
      id: 'database',
      type: 'service',
      position: { x: 370, y: 940 },
      data: { label: 'Shared Database', icon: <Database size={18} />, color: C.purple, health: 'healthy' as const, description: 'Expand-Migrate-Contract: backward-compatible schema' },
    },

    // EMC callout
    {
      id: 'emc-note',
      type: 'info',
      position: { x: 610, y: 920 },
      data: {
        title: 'Expand-Migrate-Contract',
        text: 'EXPAND: add new columns before canary deploy. MIGRATE: backfill during traffic ramp. CONTRACT: drop old columns only after 100% promotion.',
        color: C.canary,
        badge: 'DB Migration Strategy',
        handles: { top: false, bottom: false },
      },
    },

    // Users
    {
      id: 'users',
      type: 'pipelineStage',
      position: { x: 70, y: 420 },
      data: { label: 'Users', icon: <Users size={20} />, color: C.cyan, handles: { bottom: false, top: false, right: true } },
    },
  ]

  const edges: Edge[] = [
    { id: 'e-push-build', source: 'code-push', target: 'build', type: 'animated', style: { stroke: C.purple }, markerEnd: { type: MarkerType.ArrowClosed, color: C.purple } },
    { id: 'e-build-deploy', source: 'build', target: 'deploy-canary', type: 'animated', style: { stroke: C.purple }, markerEnd: { type: MarkerType.ArrowClosed, color: C.purple } },
    { id: 'e-deploy-lb', source: 'deploy-canary', target: 'lb', type: 'animated', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'e-lb-stable', source: 'lb', target: 'stable-svc', type: 'animated', label: '95%', style: { stroke: C.blue }, data: { speed: '1.5s' }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },
    { id: 'e-lb-canary', source: 'lb', target: 'canary-svc', type: 'animated', label: '5%', style: { stroke: C.canary }, data: { speed: '5s' }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'e-canary-monitor', source: 'canary-svc', target: 'monitoring', type: 'animated', label: 'Metrics', style: { stroke: C.pink }, markerEnd: { type: MarkerType.ArrowClosed, color: C.pink } },
    { id: 'e-stable-monitor', source: 'stable-svc', target: 'monitoring', type: 'animated', label: 'Baseline', style: { stroke: C.blue }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },
    { id: 'e-monitor-25', source: 'monitoring', target: 'promote-25', type: 'success', label: 'Healthy', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-25-50', source: 'promote-25', target: 'promote-50', type: 'success', label: 'Continue', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-50-100', source: 'promote-50', target: 'promote-100', type: 'success', label: 'All Clear', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-stable-db', source: 'stable-svc', target: 'database', type: 'animated', style: { stroke: C.blue }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },
    { id: 'e-canary-db', source: 'canary-svc', target: 'database', type: 'animated', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'e-db-emc', source: 'database', target: 'emc-note', type: 'animated', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'e-users-lb', source: 'users', target: 'lb', type: 'animated', label: 'Requests', style: { stroke: C.cyan }, markerEnd: { type: MarkerType.ArrowClosed, color: C.cyan } },
  ]

  return { nodes, edges }
}

/* ────────────────────────────────────────────────────────────────────
   Scenario 4 — Database Migrations: Expand-Migrate-Contract
   ──────────────────────────────────────────────────────────────────── */
function getDbMigrationsData(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    // The problem
    {
      id: 'problem',
      type: 'info',
      position: { x: 330, y: 0 },
      data: {
        title: 'The Problem',
        text: 'In Blue/Green and Canary deployments, v1 and v2 run simultaneously against the same database. Destructive migrations (DROP, RENAME) would break v1 instantly.',
        color: C.red,
        badge: 'Shared Database',
        handles: { top: false },
      },
    },

    // Shared DB showing both versions
    {
      id: 'db-shared',
      type: 'traffic',
      position: { x: 340, y: 180 },
      data: {
        label: 'Shared Database',
        icon: <Database size={20} />,
        color: C.purple,
        splits: [
          { name: 'v1 App', percentage: 50, color: C.blue },
          { name: 'v2 App', percentage: 50, color: C.green },
        ],
      },
    },

    // ──── Phase 1: EXPAND ────
    {
      id: 'group-expand',
      type: 'group',
      position: { x: 0, y: 370 },
      style: { width: 300, height: 520 },
      data: { label: 'Phase 1: Expand', icon: <Plus size={14} />, color: C.green, width: 300, height: 520 },
    },
    {
      id: 'expand-migrate',
      type: 'pipelineStage',
      parentId: 'group-expand',
      position: { x: 30, y: 50 },
      data: {
        label: 'Run Migration',
        icon: <DatabaseZap size={20} />,
        description: 'ALTER TABLE ADD new_column\nKeep old_column intact',
        color: C.green,
      },
    },
    {
      id: 'expand-deploy',
      type: 'pipelineStage',
      parentId: 'group-expand',
      position: { x: 30, y: 190 },
      data: {
        label: 'Deploy v2 Code',
        icon: <Rocket size={20} />,
        description: 'v2 writes to BOTH old_column and new_column (dual-write)',
        color: C.green,
      },
    },
    {
      id: 'expand-db',
      type: 'service',
      parentId: 'group-expand',
      position: { x: 50, y: 340 },
      data: {
        label: 'DB: Both columns exist',
        icon: <Table2 size={18} />,
        color: C.green,
        health: 'healthy' as const,
        description: 'v1 reads old_column\nv2 writes both',
      },
    },

    // ──── Phase 2: MIGRATE ────
    {
      id: 'group-migrate',
      type: 'group',
      position: { x: 330, y: 370 },
      style: { width: 300, height: 520 },
      data: { label: 'Phase 2: Migrate', icon: <RefreshCw size={14} />, color: C.canary, width: 300, height: 520 },
    },
    {
      id: 'migrate-backfill',
      type: 'pipelineStage',
      parentId: 'group-migrate',
      position: { x: 30, y: 50 },
      data: {
        label: 'Backfill Data',
        icon: <RefreshCw size={20} />,
        description: 'Background job copies old_column data into new_column for existing rows',
        color: C.canary,
      },
    },
    {
      id: 'migrate-verify',
      type: 'pipelineStage',
      parentId: 'group-migrate',
      position: { x: 30, y: 190 },
      data: {
        label: 'Verify Consistency',
        icon: <TestTube2 size={20} />,
        description: 'Validate all rows have matching data in both columns. Run reconciliation checks.',
        color: C.canary,
      },
    },
    {
      id: 'migrate-db',
      type: 'service',
      parentId: 'group-migrate',
      position: { x: 50, y: 340 },
      data: {
        label: 'DB: Data synchronized',
        icon: <Table2 size={18} />,
        color: C.canary,
        health: 'healthy' as const,
        description: 'Both columns hold\nidentical data',
      },
    },

    // ──── Phase 3: CONTRACT ────
    {
      id: 'group-contract',
      type: 'group',
      position: { x: 660, y: 370 },
      style: { width: 300, height: 520 },
      data: { label: 'Phase 3: Contract', icon: <Minus size={14} />, color: C.blue, width: 300, height: 520 },
    },
    {
      id: 'contract-decommission',
      type: 'pipelineStage',
      parentId: 'group-contract',
      position: { x: 30, y: 50 },
      data: {
        label: 'Decommission v1',
        icon: <XCircle size={20} />,
        description: 'All traffic now on v2. Old Blue / stable instances fully shut down.',
        color: C.blue,
      },
    },
    {
      id: 'contract-cleanup',
      type: 'pipelineStage',
      parentId: 'group-contract',
      position: { x: 30, y: 190 },
      data: {
        label: 'Drop Old Column',
        icon: <Minus size={20} />,
        description: 'ALTER TABLE DROP old_column\nRemove dual-write code from v2',
        color: C.blue,
      },
    },
    {
      id: 'contract-db',
      type: 'service',
      parentId: 'group-contract',
      position: { x: 50, y: 340 },
      data: {
        label: 'DB: Clean schema',
        icon: <Table2 size={18} />,
        color: C.blue,
        health: 'healthy' as const,
        description: 'Only new_column remains\nSchema is clean',
      },
    },

    // Timeline callouts
    {
      id: 'timing-expand',
      type: 'info',
      position: { x: 20, y: 940 },
      data: {
        title: 'When: Before Deploy',
        text: 'Run EXPAND migration before deploying any new app code. This is safe because adding a column does not affect v1.',
        color: C.green,
        badge: 'Blue/Green: Before Green deploy  •  Canary: Before canary deploy',
        handles: { bottom: false },
      },
    },
    {
      id: 'timing-migrate',
      type: 'info',
      position: { x: 340, y: 940 },
      data: {
        title: 'When: During Rollout',
        text: 'Run MIGRATE while both versions coexist. v1 still reads old_column, v2 reads new_column. Both are kept in sync by dual-write.',
        color: C.canary,
        badge: 'Blue/Green: During smoke tests  •  Canary: During traffic ramp',
        handles: { bottom: false },
      },
    },
    {
      id: 'timing-contract',
      type: 'info',
      position: { x: 660, y: 940 },
      data: {
        title: 'When: After Full Rollout',
        text: 'Only run CONTRACT after v1 is completely gone. If you need to roll back, the old column is still there.',
        color: C.blue,
        badge: 'Blue/Green: After Blue decommission  •  Canary: After 100% promotion',
        handles: { bottom: false },
      },
    },

    // Rollback safety callout
    {
      id: 'rollback-safety',
      type: 'info',
      position: { x: 330, y: 1130 },
      data: {
        title: 'Rollback Safety',
        text: 'Because the old column persists through Phases 1 and 2, you can roll back to v1 at any time. The contract phase is the point of no return — only proceed when confident.',
        color: C.red,
        badge: 'Key Insight',
        handles: { top: false, bottom: false },
      },
    },
  ]

  const edges: Edge[] = [
    // Problem to shared DB
    { id: 'e-problem-db', source: 'problem', target: 'db-shared', type: 'denied', label: 'Both versions hit same DB', markerEnd: { type: MarkerType.ArrowClosed, color: C.red } },

    // Shared DB to phase 1
    { id: 'e-db-expand', source: 'db-shared', target: 'expand-migrate', type: 'animated', label: 'Solution: EMC Pattern', style: { stroke: C.green }, markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },

    // Phase 1 internal
    { id: 'e-expand-deploy', source: 'expand-migrate', target: 'expand-deploy', type: 'animated', style: { stroke: C.green }, markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-expand-db', source: 'expand-deploy', target: 'expand-db', type: 'animated', style: { stroke: C.green }, markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },

    // Phase 1 → Phase 2
    { id: 'e-expand-migrate-phase', source: 'expand-db', target: 'migrate-backfill', type: 'success', label: 'Schema ready', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },

    // Phase 2 internal
    { id: 'e-backfill-verify', source: 'migrate-backfill', target: 'migrate-verify', type: 'animated', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'e-verify-db', source: 'migrate-verify', target: 'migrate-db', type: 'animated', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },

    // Phase 2 → Phase 3
    { id: 'e-migrate-contract-phase', source: 'migrate-db', target: 'contract-decommission', type: 'success', label: 'Data synced', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },

    // Phase 3 internal
    { id: 'e-decom-cleanup', source: 'contract-decommission', target: 'contract-cleanup', type: 'animated', style: { stroke: C.blue }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },
    { id: 'e-cleanup-db', source: 'contract-cleanup', target: 'contract-db', type: 'animated', style: { stroke: C.blue }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },

    // Phases to timing
    { id: 'e-expand-timing', source: 'expand-db', target: 'timing-expand', type: 'animated', style: { stroke: C.green }, markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
    { id: 'e-migrate-timing', source: 'migrate-db', target: 'timing-migrate', type: 'animated', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'e-contract-timing', source: 'contract-db', target: 'timing-contract', type: 'animated', style: { stroke: C.blue }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },

    // Timing to rollback safety
    { id: 'e-timing-rollback', source: 'timing-migrate', target: 'rollback-safety', type: 'denied', label: 'Rollback safe until Contract', markerEnd: { type: MarkerType.ArrowClosed, color: C.red } },
  ]

  return { nodes, edges }
}

/* ────────────────────────────────────────────────────────────────────
   Scenario 5 — Rollback Scenarios
   ──────────────────────────────────────────────────────────────────── */
function getRollbackData(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    // Health Check
    {
      id: 'health-check',
      type: 'pipelineStage',
      position: { x: 370, y: 0 },
      data: { label: 'Health Check Fails', icon: <AlertTriangle size={20} />, description: 'Automated monitoring detects elevated error rates or failed health probes', color: C.red, handles: { top: false } },
    },

    // Blue/Green Rollback
    {
      id: 'group-bg-rollback',
      type: 'group',
      position: { x: 30, y: 150 },
      style: { width: 380, height: 700 },
      data: { label: 'Blue/Green Rollback', icon: <ArrowRightLeft size={14} />, color: C.blue, width: 380, height: 700 },
    },
    {
      id: 'bg-detect',
      type: 'pipelineStage',
      parentId: 'group-bg-rollback',
      position: { x: 80, y: 50 },
      data: { label: 'Detect Failure', icon: <XCircle size={20} />, description: 'Green env health probes fail or error rate spikes', color: C.red },
    },
    {
      id: 'bg-switch-back',
      type: 'pipelineStage',
      parentId: 'group-bg-rollback',
      position: { x: 80, y: 190 },
      data: { label: 'Switch Traffic Back', icon: <ArrowRightLeft size={20} />, description: 'Load balancer atomically routes all traffic back to Blue', color: C.blue },
    },
    {
      id: 'bg-lb',
      type: 'traffic',
      parentId: 'group-bg-rollback',
      position: { x: 70, y: 340 },
      data: {
        label: 'Load Balancer',
        icon: <ArrowRightLeft size={20} />,
        color: C.blue,
        splits: [
          { name: 'Blue', percentage: 100, color: C.blue },
          { name: 'Green', percentage: 0, color: C.red },
        ],
      },
    },
    {
      id: 'bg-restored',
      type: 'info',
      parentId: 'group-bg-rollback',
      position: { x: 70, y: 520 },
      data: { title: 'Service Restored', text: 'Blue env (v1.0) continues serving. Green can be debugged offline. Recovery time: seconds.', color: C.green, badge: 'Instant Rollback', handles: { bottom: false } },
    },

    // Canary Rollback
    {
      id: 'group-canary-rollback',
      type: 'group',
      position: { x: 500, y: 150 },
      style: { width: 380, height: 700 },
      data: { label: 'Canary Rollback', icon: <Gauge size={14} />, color: C.canary, width: 380, height: 700 },
    },
    {
      id: 'canary-detect',
      type: 'pipelineStage',
      parentId: 'group-canary-rollback',
      position: { x: 80, y: 50 },
      data: { label: 'Detect Anomaly', icon: <Activity size={20} />, description: 'Canary metrics diverge: higher latency, error rates vs. baseline', color: C.red },
    },
    {
      id: 'canary-stop',
      type: 'pipelineStage',
      parentId: 'group-canary-rollback',
      position: { x: 80, y: 190 },
      data: { label: 'Stop Canary Traffic', icon: <Shield size={20} />, description: 'Route 100% traffic back to stable instances, drain canary', color: C.canary },
    },
    {
      id: 'canary-lb',
      type: 'traffic',
      parentId: 'group-canary-rollback',
      position: { x: 70, y: 340 },
      data: {
        label: 'Traffic Router',
        icon: <ArrowRightLeft size={20} />,
        color: C.canary,
        splits: [
          { name: 'Stable', percentage: 100, color: C.blue },
          { name: 'Canary', percentage: 0, color: C.red },
        ],
      },
    },
    {
      id: 'canary-restored',
      type: 'info',
      parentId: 'group-canary-rollback',
      position: { x: 70, y: 520 },
      data: { title: 'Blast Radius Contained', text: 'Only 5% of users were affected. Stable pool absorbs all traffic. Canary pod torn down for investigation.', color: C.green, badge: 'Minimal Impact', handles: { bottom: false } },
    },

    // Shared outcomes
    {
      id: 'investigate',
      type: 'pipelineStage',
      position: { x: 370, y: 920 },
      data: { label: 'Post-Mortem & Fix', icon: <Layers size={20} />, description: 'Investigate root cause, fix issue, re-enter CI/CD pipeline with corrected code', color: C.purple, handles: { bottom: false } },
    },

    // Users
    {
      id: 'users-safe',
      type: 'service',
      position: { x: 380, y: 1070 },
      data: { label: 'Users Unaffected', icon: <CheckCircle2 size={18} />, color: C.green, health: 'healthy' as const, description: 'Service continuity preserved', handles: { bottom: false } },
    },
  ]

  const edges: Edge[] = [
    // Health to both flows
    { id: 'hc-bg', source: 'health-check', target: 'bg-detect', type: 'denied', label: 'Blue/Green', markerEnd: { type: MarkerType.ArrowClosed, color: C.red } },
    { id: 'hc-canary', source: 'health-check', target: 'canary-detect', type: 'denied', label: 'Canary', markerEnd: { type: MarkerType.ArrowClosed, color: C.red } },

    // Blue/Green rollback path
    { id: 'bg-d-switch', source: 'bg-detect', target: 'bg-switch-back', type: 'animated', label: 'Trigger Rollback', style: { stroke: C.blue }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },
    { id: 'bg-switch-lb', source: 'bg-switch-back', target: 'bg-lb', type: 'animated', label: 'Reconfigure LB', style: { stroke: C.blue }, markerEnd: { type: MarkerType.ArrowClosed, color: C.blue } },
    { id: 'bg-lb-restored', source: 'bg-lb', target: 'bg-restored', type: 'success', label: 'Traffic on Blue', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },

    // Canary rollback path
    { id: 'canary-d-stop', source: 'canary-detect', target: 'canary-stop', type: 'animated', label: 'Trigger Rollback', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'canary-stop-lb', source: 'canary-stop', target: 'canary-lb', type: 'animated', label: 'Drain Canary', style: { stroke: C.canary }, markerEnd: { type: MarkerType.ArrowClosed, color: C.canary } },
    { id: 'canary-lb-restored', source: 'canary-lb', target: 'canary-restored', type: 'success', label: 'All to Stable', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },

    // To investigation
    { id: 'bg-investigate', source: 'bg-restored', target: 'investigate', type: 'animated', style: { stroke: C.purple }, markerEnd: { type: MarkerType.ArrowClosed, color: C.purple } },
    { id: 'canary-investigate', source: 'canary-restored', target: 'investigate', type: 'animated', style: { stroke: C.purple }, markerEnd: { type: MarkerType.ArrowClosed, color: C.purple } },
    { id: 'investigate-users', source: 'investigate', target: 'users-safe', type: 'success', label: 'Service Intact', markerEnd: { type: MarkerType.ArrowClosed, color: C.green } },
  ]

  return { nodes, edges }
}

/* ────────────────────────────────────────────────────────────────────
   App Shell
   ──────────────────────────────────────────────────────────────────── */

const scenarioInfo: Record<Scenario, { title: string; description: string }> = {
  overview: {
    title: 'Deployment Strategies Overview',
    description: 'Compare Traditional, Blue/Green, and Canary deployment strategies — see how each handles downtime, risk, and rollback.',
  },
  'blue-green': {
    title: 'Blue/Green Deployment Flow',
    description: 'Two identical environments. Deploy to idle (Green), validate, then atomically swap traffic from Blue to Green for zero-downtime releases.',
  },
  canary: {
    title: 'Canary Deployment Flow',
    description: 'Gradually shift traffic (5% → 25% → 50% → 100%) to the new version while monitoring metrics. Roll back instantly if anomalies appear.',
  },
  'db-migrations': {
    title: 'DB Migrations: Expand-Migrate-Contract',
    description: 'Both versions share one database. The Expand-Migrate-Contract (EMC) pattern ensures schema changes are safe: add new columns first, backfill data, then drop old columns only after the old version is gone.',
  },
  rollback: {
    title: 'Rollback Scenarios',
    description: 'When things go wrong: how Blue/Green and Canary strategies recover instantly with minimal blast radius.',
  },
}

const scenarioIcons: Record<Scenario, typeof Globe> = {
  overview: Globe,
  'blue-green': ArrowRightLeft,
  canary: Gauge,
  'db-migrations': DatabaseZap,
  rollback: AlertTriangle,
}

const layoutDirections: { dir: LayoutDirection | 'manual'; label: string; icon: typeof ArrowDown }[] = [
  { dir: 'manual', label: 'Manual', icon: RotateCcw },
  { dir: 'TB', label: 'Top → Bottom', icon: ArrowDown },
  { dir: 'LR', label: 'Left → Right', icon: ArrowRight },
  { dir: 'BT', label: 'Bottom → Top', icon: ArrowUp },
  { dir: 'RL', label: 'Right → Left', icon: ArrowLeft },
]

function FlowContent({ scenario }: { scenario: Scenario }) {
  const { fitView } = useReactFlow()

  return (
    <>
      <Panel position="top-left" className="info-panel">
        <h1>{scenarioInfo[scenario].title}</h1>
        <p>{scenarioInfo[scenario].description}</p>
      </Panel>

      <Panel position="bottom-left" className="legend-panel">
        <div className="legend">
          <span className="legend-title">Legend</span>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: C.blue }} />
              Blue / Stable
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: C.green }} />
              Green / Healthy
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: C.canary }} />
              Canary
            </div>
            <div className="legend-item">
              <span className="legend-line" style={{ background: C.purple }} />
              CI/CD Flow
            </div>
            <div className="legend-item">
              <span className="legend-line" style={{ background: '#60a5fa' }} />
              Traffic
            </div>
            <div className="legend-item">
              <span className="legend-line dashed" style={{ color: C.red }} />
              Failure
            </div>
          </div>
        </div>
      </Panel>

      <button className="fit-btn" onClick={() => fitView({ padding: 0.2, duration: 300 })}>
        Fit View
      </button>
    </>
  )
}

export default function App() {
  const [scenario, setScenario] = useState<Scenario>('overview')
  const [layoutDir, setLayoutDir] = useState<LayoutDirection | 'manual'>('manual')
  const initial = getScenarioData(scenario)
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges)
  const { highlight, onNodeClick, clearHighlight, applyHighlightClasses } = usePathHighlight()

  const applyData = useCallback((data: { nodes: Node[]; edges: Edge[] }, dir: LayoutDirection | 'manual') => {
    clearHighlight()
    if (dir === 'manual') {
      setNodes(data.nodes)
      setEdges(data.edges)
    } else {
      const laid = applyLayout(data.nodes, data.edges, dir)
      setNodes(laid.nodes)
      setEdges(laid.edges)
    }
  }, [setNodes, setEdges, clearHighlight])

  const switchScenario = useCallback((s: Scenario) => {
    setScenario(s)
    applyData(getScenarioData(s), layoutDir)
  }, [applyData, layoutDir])

  const switchLayout = useCallback((dir: LayoutDirection | 'manual') => {
    setLayoutDir(dir)
    applyData(getScenarioData(scenario), dir)
  }, [applyData, scenario])

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onNodeClick(_, node, edges)
  }, [onNodeClick, edges])

  const { nodes: displayNodes, edges: displayEdges } = applyHighlightClasses(nodes, edges)

  return (
    <div className={`app ${highlight.active ? 'path-active' : ''}`}>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={clearHighlight}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <Controls className="flow-controls" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'group') return 'transparent'
            const d = node.data as { color?: string }
            return d.color ?? '#60a5fa'
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="flow-minimap"
        />

        <FlowContent scenario={scenario} />

        <Panel position="top-right" className="scenario-panel">
          <div className="panel-section-label">Scenario</div>
          <div className="scenario-buttons">
            {(Object.keys(scenarioInfo) as Scenario[]).map((s) => {
              const Icon = scenarioIcons[s]
              return (
                <button
                  key={s}
                  className={`scenario-btn ${scenario === s ? 'active' : ''}`}
                  onClick={() => switchScenario(s)}
                >
                  <Icon size={14} />
                  {scenarioInfo[s].title}
                </button>
              )
            })}
          </div>
          <div className="panel-divider" />
          <div className="panel-section-label">Layout</div>
          <div className="layout-buttons">
            {layoutDirections.map(({ dir, label, icon: Icon }) => (
              <button
                key={dir}
                className={`layout-btn ${layoutDir === dir ? 'active' : ''}`}
                onClick={() => switchLayout(dir)}
                title={label}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
