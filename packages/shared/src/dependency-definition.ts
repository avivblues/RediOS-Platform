import type { MetadataType } from './metadata-definition';

export type DependencyNodeType = Extract<
  MetadataType,
  | 'APPLICATION'
  | 'ENTITY'
  | 'FIELD'
  | 'ACTION'
  | 'WORKFLOW'
  | 'PROCESS'
  | 'BUSINESS'
  | 'EVENT'
  | 'LEDGER'
  | 'RELATION'
  | 'VIEW'
  | 'UI'
  | 'FORM'
  | 'THEME'
  | 'NAVIGATION'
  | 'SECURITY_POLICY'
  | 'EXPERIENCE'
  | 'SYNC_POLICY'
  | 'CONFLICT_POLICY'
>;

export interface DependencyNode {
  type: DependencyNodeType;
  code: string;
}

export type DependencyRelationship = 'USES' | 'REFERENCES' | 'BINDS' | 'TRIGGERS' | 'RENDERS';

export interface DependencyReference {
  source: DependencyNode;
  dependsOn: DependencyNode;
  relationship: DependencyRelationship;
}

export type DependencyImpactLevel = 'BREAKING' | 'WARNING' | 'INFO';

export interface DependencyImpact {
  type: DependencyNodeType;
  code: string;
  impact: DependencyImpactLevel;
  reason: string;
}

export interface ImpactAnalysisResult {
  target: DependencyNode;
  safe: boolean;
  impacts: DependencyImpact[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  references: DependencyReference[];
}
