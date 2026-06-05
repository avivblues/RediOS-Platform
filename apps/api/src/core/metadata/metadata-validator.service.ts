import { Injectable } from '@nestjs/common';
import type { MetadataDefinition } from '@redios/shared';

export interface MetadataValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class MetadataValidator {
  validate(definition: MetadataDefinition | null): MetadataValidationResult {
    if (!definition) {
      return {
        valid: false,
        errors: ['Metadata definition was not found.'],
      };
    }

    const errors: string[] = [];

    if (!definition.tenantId) {
      errors.push('tenantId is required.');
    }

    if (!definition.applicationCode) {
      errors.push('applicationCode is required.');
    }

    if (!definition.type) {
      errors.push('type is required.');
    }

    if (!definition.code) {
      errors.push('code is required.');
    }

    if (!definition.enabled) {
      errors.push('definition must be enabled.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
