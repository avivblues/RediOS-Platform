import { Body, Controller, Post } from '@nestjs/common';
import type { MetadataDefinition, ValidationResult } from '@redios/shared';
import { MetadataValidatorEngine } from '../core/metadata/metadata-validator-engine.service';

type MetadataValidationPayload = MetadataDefinition[] | { metadataDefinitions?: MetadataDefinition[] };

@Controller('metadata')
export class MetadataValidationController {
  constructor(private readonly validatorEngine: MetadataValidatorEngine) {}

  @Post('validate')
  validate(@Body() payload: MetadataValidationPayload): ValidationResult {
    return this.validatorEngine.validate(this.toDefinitions(payload));
  }

  private toDefinitions(payload: MetadataValidationPayload): MetadataDefinition[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    return payload.metadataDefinitions ?? [];
  }
}
