import type { MetadataDefinition, MetadataType } from './metadata-definition';

export type DesignerTargetType = Extract<MetadataType, 'FORM' | 'THEME' | 'NAVIGATION'>;

export type DesignerDraftStatus = 'DRAFT' | 'VALIDATED' | 'PUBLISHED' | 'REJECTED';

export type DesignerOperationType =
  | 'ADD_FIELD'
  | 'REMOVE_FIELD'
  | 'MOVE_FIELD'
  | 'CHANGE_COMPONENT'
  | 'CHANGE_PROPERTY'
  | 'ADD_SECTION'
  | 'REMOVE_SECTION'
  | 'UPDATE_THEME_TOKEN'
  | 'ADD_MENU'
  | 'REMOVE_MENU'
  | 'MOVE_MENU'
  | 'CHANGE_ICON'
  | 'CHANGE_TARGET';

export interface DesignerOperation {
  type: DesignerOperationType;
  path?: string;
  payload?: Record<string, unknown>;
  before?: unknown;
  after?: unknown;
  userId?: string;
  timestamp?: Date;
}

export interface DesignerChangeSet {
  id?: string;
  targetType: DesignerTargetType;
  targetCode: string;
  status: DesignerDraftStatus;
  operations: DesignerOperation[];
}

export interface MetadataDraft<TDefinition = unknown> {
  id?: string;
  tenantId: string;
  domainCode?: string;
  applicationCode: string;
  sourceMetadataId?: string;
  targetType: DesignerTargetType;
  targetCode: string;
  entityCode?: string;
  status: DesignerDraftStatus;
  draft: MetadataDefinition<TDefinition>;
  changes: DesignerOperation[];
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MetadataVersion<TDefinition = unknown> {
  id?: string;
  tenantId: string;
  domainCode?: string;
  applicationCode: string;
  sourceMetadataId?: string;
  targetType: DesignerTargetType;
  targetCode: string;
  entityCode?: string;
  version: number;
  metadata: MetadataDefinition<TDefinition>;
  createdBy: string;
  createdAt?: Date;
}
