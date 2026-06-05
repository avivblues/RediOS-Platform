import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { MetadataDefinition, MetadataType, RuntimeContext } from '@redios/shared';
import { Model } from 'mongoose';
import type { MetadataProvider, MetadataQuery } from '../metadata-provider.interface';
import { METADATA_DEFINITION_MODEL } from '../schemas/metadata-definition.schema';

type MetadataDefinitionRecord = MetadataDefinition & { _id?: unknown };

@Injectable()
export class MongoMetadataProvider implements MetadataProvider {
  constructor(
    @InjectModel(METADATA_DEFINITION_MODEL)
    private readonly model: Model<MetadataDefinitionRecord>,
  ) {}

  findMetadata(context: RuntimeContext, query: MetadataQuery = {}): Promise<MetadataDefinition[]> {
    return this.find(context, query);
  }

  async saveMetadata(context: RuntimeContext, definition: MetadataDefinition): Promise<MetadataDefinition> {
    const scope = this.createScope(context);
    const persisted = await this.model
      .findOneAndUpdate(
        {
          ...scope,
          type: definition.type,
          code: definition.code,
          version: definition.version,
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

    return this.toDefinition(persisted);
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
        ...this.createScope(context, query.applicationCode),
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
        ...this.createScope(context, query.applicationCode),
        ...(query.type ? { type: query.type } : {}),
        ...(query.code ? { code: query.code } : {}),
        ...(query.enabledOnly ? { enabled: true } : {}),
      })
      .sort({ version: -1 })
      .lean()
      .exec();

    return record ? this.toDefinition(record) : null;
  }

  private createScope(context: RuntimeContext, applicationCode = context.applicationCode): Record<string, string> {
    return {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode,
    };
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
