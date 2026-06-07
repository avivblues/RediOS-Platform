import type { RuntimePackageDefinition, RuntimeProjectionProvider } from '@redios/shared';

export class NoopRuntimeProjectionProvider implements RuntimeProjectionProvider {
  project(_packageDefinition: RuntimePackageDefinition): void {
    return undefined;
  }
}
