import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { RuntimeContext, RuntimeDocument } from '@redios/shared';
import { Model } from 'mongoose';
import {
  type RuntimeDocumentPayload,
  type RuntimeDocumentUpdatePayload,
  type StorageProvider,
} from '../storage-provider.interface';
import { RUNTIME_DOCUMENT_MODEL } from '../schemas/runtime-document.schema';

type RuntimeDocumentRecord = RuntimeDocument & { _id?: unknown };

@Injectable()
export class MongodbStorageProvider implements StorageProvider {
  constructor(
    @InjectModel(RUNTIME_DOCUMENT_MODEL)
    private readonly model: Model<RuntimeDocumentRecord>,
  ) {}

  async create(
    context: RuntimeContext,
    entityCode: string,
    payload: RuntimeDocumentPayload,
  ): Promise<RuntimeDocument> {
    const created = await this.model.create({
      ...this.createScope(context, entityCode),
      documentNo: payload.documentNo,
      status: payload.status,
      data: payload.data,
      metadataVersion: payload.metadataVersion,
      createdBy: context.userId,
    });

    return this.toDocument(created.toObject());
  }

  async update(
    context: RuntimeContext,
    entityCode: string,
    id: string,
    payload: RuntimeDocumentUpdatePayload,
  ): Promise<RuntimeDocument | null> {
    const updated = await this.model
      .findOneAndUpdate(
        {
          _id: id,
          ...this.createScope(context, entityCode),
        },
        {
          $set: {
            ...payload,
            updatedBy: context.userId,
          },
        },
        {
          new: true,
        },
      )
      .lean()
      .exec();

    return updated ? this.toDocument(updated) : null;
  }

  async findOne(context: RuntimeContext, entityCode: string, id: string): Promise<RuntimeDocument | null> {
    const record = await this.model
      .findOne({
        _id: id,
        ...this.createScope(context, entityCode),
      })
      .lean()
      .exec();

    return record ? this.toDocument(record) : null;
  }

  async findMany(
    context: RuntimeContext,
    entityCode: string,
    query: Record<string, unknown> = {},
  ): Promise<RuntimeDocument[]> {
    const records = await this.model
      .find({
        ...query,
        ...this.createScope(context, entityCode),
      })
      .lean()
      .exec();

    return records.map((record) => this.toDocument(record));
  }

  private createScope(context: RuntimeContext, entityCode: string): Record<string, string> {
    return {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      entityCode,
    };
  }

  private toDocument(record: RuntimeDocumentRecord): RuntimeDocument {
    return {
      id: String(record._id ?? record.id ?? ''),
      tenantId: record.tenantId,
      domainCode: record.domainCode,
      applicationCode: record.applicationCode,
      entityCode: record.entityCode,
      documentNo: record.documentNo,
      status: record.status,
      data: record.data,
      metadataVersion: record.metadataVersion,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
