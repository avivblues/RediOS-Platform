import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { MetadataDefinition, MetadataType, RuntimeContext } from '@redios/shared';
import { Model } from 'mongoose';
import type { MetadataProvider, MetadataQuery } from '../metadata-provider.interface';
import { METADATA_DEFINITION_MODEL } from '../schemas/metadata-definition.schema';
import { MetadataCache } from '../metadata.cache';

type MetadataDefinitionRecord = MetadataDefinition & { _id?: unknown };

@Injectable()
export class MongoMetadataProvider implements MetadataProvider {
  constructor(
    @InjectModel(METADATA_DEFINITION_MODEL)
    private readonly model: Model<MetadataDefinitionRecord>,
    private readonly metadataCache: MetadataCache,
  ) {}

  findMetadata(context: RuntimeContext, query: MetadataQuery = {}): Promise<MetadataDefinition[]> {
    return this.find(context, query);
  }

  async saveMetadata(context: RuntimeContext, definition: MetadataDefinition): Promise<MetadataDefinition> {
    const scope = this.createScope(context, definition.applicationCode);
    const persisted = await this.model
      .findOneAndUpdate(
        {
          ...scope,
          type: definition.type,
          code: definition.code,
          ...this.createDefinitionIdentity(definition),
        },
        {
          ...definition,
          ...scope,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean()
      .exec();

    const saved = this.toDefinition(persisted);
    this.metadataCache.set(saved);
    return saved;
  }

  getByCode(context: RuntimeContext, type: MetadataType, code: string): Promise<MetadataDefinition | null> {
    return this.findOne(context, {
      type,
      code,
      enabledOnly: true,
    });
  }

  getByType(context: RuntimeContext, type: MetadataType): Promise<MetadataDefinition[]> {
    return this.find(context, {
      type,
      enabledOnly: true,
    });
  }

  async find(context: RuntimeContext, query: MetadataQuery = {}): Promise<MetadataDefinition[]> {
    const records = await this.model
      .find({
        ...this.createScope(context, query.allApplications ? undefined : query.applicationCode, query.allApplications),
        ...(query.type ? { type: query.type } : {}),
        ...(query.code ? { code: query.code } : {}),
        ...(query.enabledOnly ? { enabled: true } : {}),
      })
      .sort({ version: -1 })
      .lean()
      .exec();

    return records.map((record) => this.toDefinition(record));
  }

  async findOne(context: RuntimeContext, query: MetadataQuery): Promise<MetadataDefinition | null> {
    const record = await this.model
      .findOne({
        ...this.createScope(context, query.allApplications ? undefined : query.applicationCode, query.allApplications),
        ...(query.type ? { type: query.type } : {}),
        ...(query.code ? { code: query.code } : {}),
        ...(query.enabledOnly ? { enabled: true } : {}),
      })
      .sort({ version: -1 })
      .lean()
      .exec();

    return record ? this.toDefinition(record) : null;
  }

  private createScope(
    context: RuntimeContext,
    applicationCode = context.applicationCode,
    allApplications = false,
  ): Record<string, string> {
    const scope = {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
    };

    return allApplications ? scope : { ...scope, applicationCode };
  }

  private createDefinitionIdentity(definition: MetadataDefinition): Record<string, string> {
    if (definition.type === 'UI' && definition.definition && typeof definition.definition === 'object' && 'kind' in definition.definition) {
      const kind = (definition.definition as { kind?: unknown }).kind;

      if (typeof kind === 'string') {
        return {
          'definition.kind': kind,
        };
      }
    }

    if (definition.definition && typeof definition.definition === 'object' && 'entityCode' in definition.definition) {
      const entityCode = (definition.definition as { entityCode?: unknown }).entityCode;

      if (typeof entityCode === 'string') {
        return {
          'definition.entityCode': entityCode,
        };
      }
    }

    return {};
  }

  private toDefinition(record: MetadataDefinitionRecord): MetadataDefinition {
    return {
      id: String(record._id ?? record.id ?? ''),
      tenantId: record.tenantId,
      domainCode: record.domainCode,
      applicationCode: record.applicationCode,
      type: record.type,
      code: record.code,
      name: record.name,
      version: record.version,
      enabled: record.enabled,
      definition: record.definition,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
