import { Injectable } from '@nestjs/common';
import type { IntegrationMappingDefinition } from '@redios/shared';

@Injectable()
export class MappingEngine {
  apply(mapping: IntegrationMappingDefinition, payload: Record<string, unknown>): Record<string, unknown> {
    const output: Record<string, unknown> = {};

    for (const [sourcePath, targetPath] of Object.entries(mapping.input ?? {})) {
      const value = this.getPath(payload, sourcePath);

      if (value !== undefined) {
        this.setPath(output, targetPath, value);
      }
    }

    return output;
  }

  private getPath(payload: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((cursor, segment) => {
      if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) {
        return undefined;
      }

      return (cursor as Record<string, unknown>)[segment];
    }, payload);
  }

  private setPath(payload: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let cursor = payload;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        cursor[part] = value;
        return;
      }

      const next = cursor[part];

      if (!next || typeof next !== 'object' || Array.isArray(next)) {
        cursor[part] = {};
      }

      cursor = cursor[part] as Record<string, unknown>;
    });
  }
}
