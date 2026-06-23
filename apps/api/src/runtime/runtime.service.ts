import { Injectable } from '@nestjs/common';
import type { RuntimeDocument } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import {
  RuntimeExecutor,
  type RuntimeActionResult,
  type RuntimeExecutionResult,
} from '../core/runtime/runtime-executor.service';
import { StateEngine } from '../core/tunasflow/state/state.engine';
import { RuntimeCreateDto } from './dto/runtime-create.dto';
import { RuntimeUpdateDto } from './dto/runtime-update.dto';

@Injectable()
export class RuntimeService {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly runtimeExecutor: RuntimeExecutor,
    private readonly stateEngine: StateEngine,
  ) {}

  create(headers: RuntimeHeaders, entityCode: string, payload: RuntimeCreateDto): Promise<RuntimeExecutionResult> {
    const context = this.contextEngine.resolve(headers);
    return this.runtimeExecutor.create({
      context,
      entityCode,
      payload: payload.data,
    });
  }

  createByMetadataAction(
    headers: RuntimeHeaders,
    entityCode: string,
    actionCode: string,
    payload: RuntimeCreateDto,
  ): Promise<RuntimeExecutionResult> {
    const context = this.contextEngine.resolve(headers);

    // Universal runtime pipeline: auth/context -> metadata resolver -> permission/validation/action -> storage.
    return this.runtimeExecutor.create({
      context,
      entityCode,
      payload: {
        ...payload.data,
        __runtimeAction: actionCode,
      },
    });
  }

  findMany(
    headers: RuntimeHeaders,
    entityCode: string,
    query: Record<string, unknown>,
  ): Promise<RuntimeDocument[]> {
    const context = this.contextEngine.resolve(headers);
    return this.runtimeExecutor.findMany({
      context,
      entityCode,
      query,
    });
  }

  findOne(headers: RuntimeHeaders, entityCode: string, id: string): Promise<RuntimeDocument | null> {
    const context = this.contextEngine.resolve(headers);
    return this.runtimeExecutor.findOne({
      context,
      entityCode,
      id,
    });
  }

  update(
    headers: RuntimeHeaders,
    entityCode: string,
    id: string,
    payload: RuntimeUpdateDto,
  ): Promise<RuntimeDocument | null> {
    const context = this.contextEngine.resolve(headers);
    return this.runtimeExecutor.update({
      context,
      entityCode,
      id,
      payload: payload.data,
    });
  }

  prepareAction(
    headers: RuntimeHeaders,
    entityCode: string,
    id: string,
    actionCode: string,
    payload: unknown,
  ): Promise<RuntimeActionResult> {
    const context = this.contextEngine.resolve(headers);
    const actionPayload = this.actionPayload(payload);
    return this.runtimeExecutor.prepareAction({
      context,
      entityCode,
      id,
      actionCode,
      payload: actionPayload.payload,
      source: actionPayload.source,
      clientVersion: actionPayload.clientVersion,
      serverVersion: actionPayload.serverVersion,
      clientData: actionPayload.clientData,
    });
  }

  getStateHistory(headers: RuntimeHeaders, entityCode: string, documentId: string) {
    const context = this.contextEngine.resolve(headers);
    return this.stateEngine.findByDocument(context, entityCode, documentId);
  }

  private actionPayload(payload: unknown): {
    payload: unknown;
    source?: 'OFFLINE_SYNC';
    clientVersion?: number;
    serverVersion?: number;
    clientData?: Record<string, unknown>;
  } {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return { payload };
    }

    const record = payload as Record<string, unknown>;
    const source = record.source === 'OFFLINE_SYNC' ? 'OFFLINE_SYNC' : undefined;

    if (!source) {
      return { payload };
    }

    return {
      source,
      payload: record.payload ?? record.data ?? {},
      clientVersion: typeof record.clientVersion === 'number' ? record.clientVersion : undefined,
      serverVersion: typeof record.serverVersion === 'number' ? record.serverVersion : undefined,
      clientData:
        record.clientData && typeof record.clientData === 'object' && !Array.isArray(record.clientData)
          ? (record.clientData as Record<string, unknown>)
          : undefined,
    };
  }
}
