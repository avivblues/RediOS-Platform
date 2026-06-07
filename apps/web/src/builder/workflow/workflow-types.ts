import type { WorkflowDefinition, WorkflowStateDefinition, WorkflowTransitionDefinition } from '@redios/shared';

export type WorkflowSelection =
  | { kind: 'STATE'; code: string }
  | { kind: 'TRANSITION'; code: string };

export interface WorkflowCanvasPosition {
  x: number;
  y: number;
}

export interface WorkflowBuilderDraft {
  workflow: WorkflowDefinition;
  selected?: WorkflowSelection;
  positions: Record<string, WorkflowCanvasPosition>;
}

export type { WorkflowDefinition, WorkflowStateDefinition, WorkflowTransitionDefinition };
