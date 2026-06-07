import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  ConflictDetectionResult,
  ConflictFieldDifference,
  ConflictPolicyDefinition,
  ConflictResolutionStrategy,
  MetadataDefinition,
  RuntimeContext,
  RuntimeDocument,
} from '@redios/shared';
import { Model } from 'mongoose';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';
import { StorageEngine } from '../storage/storage.engine';
import { SYNC_CONFLICT_MODEL } from './schemas/sync-conflict.schema';

export interface OfflineSyncAction {
  entityCode: string;
  documentId: string;
  actionCode: string;
  payload: Record<string, unknown>;
  clientVersion?: number;
  serverVersion?: number;
  clientData?: Record<string, unknown>;
}

export interface SyncConflictRecord {
  id?: string;
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  entityCode: string;
  documentId: string;
  policy: ConflictResolutionStrategy;
  fields: ConflictFieldDifference[];
  clientData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  status: 'OPEN' | 'RESOLVED';
  createdAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: 'USE_SERVER' | 'USE_CLIENT' | 'MERGE';
}

type SyncConflictDocument = SyncConflictRecord & { _id?: unknown };

@Injectable()
export class ConflictEngine {
  constructor(
    @Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider,
    @InjectModel(SYNC_CONFLICT_MODEL) private readonly conflictModel: Model<SyncConflictDocument>,
    private readonly storageEngine: StorageEngine,
  ) {}

  async detectConflict(context: RuntimeContext, syncAction: OfflineSyncAction): Promise<ConflictDetectionResult> {
    const policy = await this.resolvePolicy(context, syncAction.entityCode);
    const serverDocument = await this.storageEngine.findOne(context, syncAction.entityCode, syncAction.documentId);

    if (!serverDocument) {
      return {
        conflict: false,
      };
    }

    const clientVersion = syncAction.clientVersion ?? numberValue(syncAction.payload.clientVersion) ?? serverDocument.metadataVersion;
    const serverVersion = syncAction.serverVersion ?? serverDocument.metadataVersion;

    if (clientVersion >= serverVersion) {
      return {
        conflict: false,
      };
    }

    const clientData = this.clientData(syncAction);
    const serverData = this.serverData(serverDocument);
    const fields = this.fieldDifferences(clientData, serverData);

    if (fields.length === 0) {
      return {
        conflict: false,
      };
    }

    const conflict = await this.storeConflict(context, syncAction, policy, fields, clientData, serverData);

    return {
      conflict: true,
      conflictId: conflict.id,
      policy: policy.strategy,
      fields,
    };
  }

  async assertNoConflict(context: RuntimeContext, syncAction: OfflineSyncAction): Promise<ConflictDetectionResult> {
    const result = await this.detectConflict(context, syncAction);

    if (result.conflict) {
      throw new ConflictException({
        status: 'CONFLICT',
        conflictId: result.conflictId,
        policy: result.policy,
        fields: result.fields,
      });
    }

    return result;
  }

  async findMany(context: RuntimeContext): Promise<SyncConflictRecord[]> {
    const records = await this.conflictModel
      .find({
        ...this.scope(context),
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec();
    return records.map((record) => this.toRecord(record));
  }

  async findOne(context: RuntimeContext, id: string): Promise<SyncConflictRecord> {
    const record = await this.conflictModel
      .findOne({
        _id: id,
        ...this.scope(context),
      })
      .lean()
      .exec();

    if (!record) {
      throw new NotFoundException('Sync conflict was not found.');
    }

    return this.toRecord(record);
  }

  async resolve(
    context: RuntimeContext,
    id: string,
    resolution: 'USE_SERVER' | 'USE_CLIENT' | 'MERGE',
  ): Promise<SyncConflictRecord> {
    const updated = await this.conflictModel
      .findOneAndUpdate(
        {
          _id: id,
          ...this.scope(context),
        },
        {
          $set: {
            status: 'RESOLVED',
            resolvedBy: context.userId,
            resolvedAt: new Date(),
            resolution,
          },
        },
        {
          new: true,
        },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Sync conflict was not found.');
    }

    return this.toRecord(updated);
  }

  async resolvePolicy(context: RuntimeContext, entityCode: string): Promise<ConflictPolicyDefinition> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      type: 'CONFLICT_POLICY',
      enabledOnly: true,
    });
    const policy = metadata
      .map((record) => record.definition as ConflictPolicyDefinition)
      .find((definition) => definition.entityCode === entityCode && definition.enabled);

    return (
      policy ?? {
        code: 'DEFAULT_CONFLICT_POLICY',
        entityCode,
        enabled: true,
        strategy: 'MANUAL_REVIEW',
        rules: [],
      }
    );
  }

  private async storeConflict(
    context: RuntimeContext,
    syncAction: OfflineSyncAction,
    policy: ConflictPolicyDefinition,
    fields: ConflictFieldDifference[],
    clientData: Record<string, unknown>,
    serverData: Record<string, unknown>,
  ): Promise<SyncConflictRecord> {
    const record = await this.conflictModel.create({
      ...this.scope(context),
      entityCode: syncAction.entityCode,
      documentId: syncAction.documentId,
      policy: policy.strategy,
      fields,
      clientData,
      serverData,
      status: 'OPEN',
    });
    return this.toRecord(record.toObject());
  }

  private clientData(syncAction: OfflineSyncAction): Record<string, unknown> {
    return {
      ...(syncAction.clientData ?? {}),
      ...(syncAction.payload ?? {}),
    };
  }

  private serverData(document: RuntimeDocument): Record<string, unknown> {
    return {
      ...document.data,
      ...(document.status ? { status: document.status } : {}),
    };
  }

  private fieldDifferences(
    clientData: Record<string, unknown>,
    serverData: Record<string, unknown>,
  ): ConflictFieldDifference[] {
    const fields = new Set([...Object.keys(clientData), ...Object.keys(serverData)]);
    return [...fields]
      .filter((field) => JSON.stringify(clientData[field] ?? null) !== JSON.stringify(serverData[field] ?? null))
      .map((field) => ({
        field,
        client: clientData[field],
        server: serverData[field],
      }));
  }

  private scope(context: RuntimeContext): Record<string, string> {
    return {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
    };
  }

  private toRecord(record: SyncConflictDocument): SyncConflictRecord {
    return {
      id: String(record._id ?? record.id ?? ''),
      tenantId: record.tenantId,
      domainCode: record.domainCode,
      applicationCode: record.applicationCode,
      entityCode: record.entityCode,
      documentId: record.documentId,
      policy: record.policy,
      fields: record.fields,
      clientData: record.clientData,
      serverData: record.serverData,
      status: record.status,
      createdAt: record.createdAt,
      resolvedBy: record.resolvedBy,
      resolvedAt: record.resolvedAt,
      resolution: record.resolution,
    };
  }
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}
