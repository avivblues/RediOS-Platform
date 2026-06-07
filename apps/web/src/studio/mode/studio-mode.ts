export type StudioMode = 'SIMPLE' | 'EXPERT';

const storageKey = 'redios.studio.mode';

export function readStudioMode(): StudioMode {
  return window.localStorage.getItem(storageKey) === 'EXPERT' ? 'EXPERT' : 'SIMPLE';
}

export function writeStudioMode(mode: StudioMode): void {
  window.localStorage.setItem(storageKey, mode);
}
