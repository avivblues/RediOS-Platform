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
    description: description ?? `${humanizeCode(normalizedCategory)} metadata for ${humanizeCode(code)}.`,
    category: normalizedCategory,
  };
}
