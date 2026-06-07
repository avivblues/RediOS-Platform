import type { RuntimeDocumentState } from '../context/runtime-context';
import type { RuntimeNode } from '../renderer/renderer-tree';

export interface RuntimeAction {
  entityCode: string;
  documentId?: string;
  actionCode: string;
  payload: Record<string, unknown>;
}

export interface ResolveActionInput {
  node: RuntimeNode;
  entityCode?: string;
  document: RuntimeDocumentState;
  actionCode?: string;
}

export function resolveAction(input: ResolveActionInput): RuntimeAction | undefined {
  const actionCode = input.actionCode ?? stringProp(input.node.props.actionCode) ?? stringProp(input.node.props.action);

  if (!actionCode || !input.entityCode) {
    return undefined;
  }

  return {
    entityCode: input.entityCode,
    documentId: input.document.id,
    actionCode,
    payload: input.document.data,
  };
}

function stringProp(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
