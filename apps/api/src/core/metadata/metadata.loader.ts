import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { MetadataDefinition, RuntimeContext } from '@redios/shared';
import { Model } from 'mongoose';
import { METADATA_DEFINITION_MODEL } from './schemas/metadata-definition.schema';
import { MetadataCache } from './metadata.cache';

type MetadataDefinitionRecord = MetadataDefinition & { _id?: unknown };

@Injectable()
export class MetadataLoader implements OnModuleInit {
  private readonly logger = new Logger(MetadataLoader.name);

  constructor(
    @InjectModel(METADATA_DEFINITION_MODEL)
    private readonly model: Model<MetadataDefinitionRecord>,
    private readonly cache: MetadataCache,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.loadAll();
    this.logger.log(`Metadata cache hydrated with ${count} definition(s).`);
  }

  async loadAll(): Promise<number> {
    const records = await this.model.find({}).lean().exec();
    this.cache.clear();
    this.cache.setMany(records.map((record) => this.toDefinition(record)));
    return records.length;
  }

  async reloadScope(context: RuntimeContext): Promise<number> {
    const records = await this.model
      .find({
        tenantId: context.tenantId,
        domainCode: context.domainCode,
        applicationCode: context.applicationCode,
      })
      .lean()
      .exec();

    this.cache.invalidateScope(context);
    this.cache.setMany(records.map((record) => this.toDefinition(record)));
    this.cache.markScopeLoaded(context);
    return records.length;
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
