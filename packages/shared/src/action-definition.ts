export interface ActionDefinition {
  code: string;
  name: string;
  entityCode: string;
  permissionCode?: string;
  workflowTransitionCode?: string;
  processCode?: string;
  enabled: boolean;
}
