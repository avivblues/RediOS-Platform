import { Injectable } from '@nestjs/common';
import type { RuntimeDocument } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import {
  RuntimeExecutor,
  type RuntimeActionResult,
  type RuntimeExecutionResult,
} from '../core/runtime/runtime-executor.service';
import { RuntimeCreateDto } from './dto/runtime-create.dto';
import { RuntimeUpdateDto } from './dto/runtime-update.dto';

@Injectable()
export class RuntimeService {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly runtimeExecutor: RuntimeExecutor,
  ) {}

  create(headers: RuntimeHeaders, entityCode: string, payload: RuntimeCreateDto): Promise<RuntimeExecutionResult> {
    const context = this.contextEngine.resolve(headers);
    return this.runtimeExecutor.create({
      context,
      entityCode,
      payload: payload.data,
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
    return this.runtimeExecutor.prepareAction({
      context,
      entityCode,
      id,
      actionCode,
      payload,
    });
  }
}
