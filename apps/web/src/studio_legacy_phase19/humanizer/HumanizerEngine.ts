import { term, terminologyMode, type StudioTermCode } from '../terminology/terminology.service';

export interface HumanizedMetadata {
  code: string;
  label: string;
  icon: string;
  description: string;
  category: string;
}

const categoryIcons: Record<string, string> = {
  APPLICATION: 'APP',
  ENTITY: 'DATA',
  FORM: 'FORM',
  UI: 'PAGE',
  WORKFLOW: 'FLOW',
  INTEGRATION: 'LINK',
  CONNECTOR: 'PLUG',
  SECURITY: 'LOCK',
  THEME: 'STYLE',
  NAVIGATION: 'NAV',
  RUNTIME_PACKAGE: 'RUN',
};

export function humanizeCode(code: string): string {
  return code
    .toLowerCase()
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function humanizeMetadata(code: string, category: string, description?: string): HumanizedMetadata {
  const normalizedCategory = category.toUpperCase();

  return {
    code,
    label: humanizeCode(code),
    icon: categoryIcons[normalizedCategory] ?? 'META',
    description: description ?? `${humanizeCode(normalizedCategory)} configuration for ${humanizeCode(code)}.`,
    category: normalizedCategory,
  };
}

export function metadataTerm(type: string, expertMode = false): string {
  const normalizedType = type.toUpperCase();

  if (isStudioTermCode(normalizedType)) {
    return term(normalizedType, terminologyMode(expertMode));
  }

  return humanizeCode(normalizedType);
}

function isStudioTermCode(value: string): value is StudioTermCode {
  return [
    'APPLICATION',
    'ENTITY',
    'FIELD',
    'FORM',
    'VIEW',
    'WORKFLOW',
    'RELATION',
    'VALIDATION',
    'SECURITY_POLICY',
    'INTEGRATION',
    'RUNTIME_PACKAGE',
  ].includes(value);
}
