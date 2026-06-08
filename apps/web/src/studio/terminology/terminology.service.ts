import { STUDIO_TERMINOLOGY, type StudioTermCode, type StudioTerminologyMode } from './terminology-map';

export type { StudioTermCode, StudioTerminologyMode };

export function terminologyMode(expertMode: boolean): StudioTerminologyMode {
  return expertMode ? 'EXPERT_MODE' : 'SIMPLE_MODE';
}

export function term(code: StudioTermCode, mode: StudioTerminologyMode): string {
  return STUDIO_TERMINOLOGY[mode][code];
}

export function terms(mode: StudioTerminologyMode) {
  return STUDIO_TERMINOLOGY[mode];
}

export function pluralTerm(code: StudioTermCode, mode: StudioTerminologyMode): string {
  const label = term(code, mode);

  if (label.endsWith('s')) {
    return label;
  }

  return `${label}s`;
}
