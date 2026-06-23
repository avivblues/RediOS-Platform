export type HumanTaskStatus = 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export type HumanTaskSource = 'PROCESS' | 'WORKFLOW' | 'MANUAL';

export interface HumanTaskDefinition {
  id: string;
  tenantId: string;
  title: string;
  entityCode?: string;
  documentId?: string;
  actionCode?: string;
  processCode?: string;
  stepCode?: string;
  assigneeUserId?: string;
  assigneeRoles: string[];
  status: HumanTaskStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  source: HumanTaskSource;
  dueAt?: string;
  approvalMode?: 'SINGLE' | 'SEQUENTIAL' | 'PARALLEL';
  approvalLevel?: number;
  approvalGroupId?: string;
  createdAt: string;
}

export interface CreateHumanTaskInput {
  tenantId: string;
  title: string;
  entityCode?: string;
  documentId?: string;
  actionCode?: string;
  processCode?: string;
  stepCode?: string;
  assigneeUserId?: string;
  assigneeRoles?: string[];
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  source?: HumanTaskSource;
  dueAt?: string;
  approvalMode?: 'SINGLE' | 'SEQUENTIAL' | 'PARALLEL';
  approvalLevel?: number;
  approvalGroupId?: string;
}
