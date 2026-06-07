import { Controller, Get, Headers, Inject } from '@nestjs/common';
import type { MetadataDefinition, MetadataType, RuntimeContext } from '@redios/shared';
import type { RuntimeHeaders } from '../core/context/context.engine';
import { METADATA_PROVIDER, type MetadataProvider } from '../core/metadata/metadata-provider.interface';

type MetadataDebugResult = {
  applications: string[];
  entities: string[];
  actions: string[];
  workflows: string[];
  processes: string[];
  business: string[];
  events: string[];
  relations: string[];
  views: string[];
  ui: string[];
  forms: string[];
  counts: Record<string, number>;
};

@Controller('metadata')
export class MetadataDebugController {
  constructor(@Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider) {}

  @Get('debug')
  async debug(@Headers() headers: RuntimeHeaders): Promise<MetadataDebugResult> {
    const context: RuntimeContext = {
      userId: this.headerValue(headers['x-user-id'], 'debug'),
      tenantId: this.headerValue(headers['x-tenant-id'], 'demo'),
      domainCode: this.headerValue(headers['x-domain-code'], 'DEFAULT'),
      applicationCode: this.headerValue(headers['x-application-code'], 'DEBUG'),
      permissions: [],
      capabilities: [],
    };
    const records = await this.metadataProvider.findMetadata(context, {
      allApplications: true,
      enabledOnly: true,
    });

    return {
      applications: this.codes(records, 'APPLICATION'),
      entities: this.codes(records, 'ENTITY'),
      actions: this.codes(records, 'ACTION'),
      workflows: this.codes(records, 'WORKFLOW'),
      processes: this.codes(records, 'PROCESS'),
      business: this.codes(records, 'BUSINESS'),
      events: this.codes(records, 'EVENT'),
      relations: this.codes(records, 'RELATION'),
      views: this.codes(records, 'VIEW'),
      ui: this.codes(records, 'UI'),
      forms: this.codes(records, 'FORM'),
      counts: this.counts(records),
    };
  }

  private codes(records: MetadataDefinition[], type: MetadataType): string[] {
    return [...new Set(records.filter((record) => record.type === type).map((record) => record.code))].sort();
  }

  private counts(records: MetadataDefinition[]): Record<string, number> {
    return records.reduce<Record<string, number>>((counts, record) => {
      counts[record.type] = (counts[record.type] ?? 0) + 1;
      return counts;
    }, {});
  }

  private headerValue(value: string | string[] | undefined, fallback: string): string {
    if (Array.isArray(value)) {
      return value[0] ?? fallback;
    }

    return value ?? fallback;
  }
}
