import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  RuntimeContext,
  RuntimeTrace,
  RuntimeTraceStatus,
  RuntimeTraceStep,
  RuntimeTraceStepEngine,
} from '@redios/shared';
import { Model } from 'mongoose';
import { RUNTIME_TRACE_MODEL } from './schemas/runtime-trace.schema';

type RuntimeTraceRecord = RuntimeTrace & { _id?: unknown };

export interface RuntimeTraceStartInput {
  entityCode: string;
  documentId?: string;
  actionCode?: string;
}

export interface RuntimeTraceFilter {
  entityCode?: string;
  documentId?: string;
  actionCode?: string;
  status?: RuntimeTraceStatus;
}

@Injectable()
export class TraceEngine {
  constructor(
    @InjectModel(RUNTIME_TRACE_MODEL)
    private readonly model: Model<RuntimeTraceRecord>,
  ) {}

  async start(context: RuntimeContext, input: RuntimeTraceStartInput): Promise<RuntimeTrace> {
    const startedAt = new Date();
    const trace = await this.model.create({
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      entityCode: input.entityCode,
      documentId: input.documentId,
      actionCode: input.actionCode,
      status: 'RUNNING',
      startedAt,
      steps: [],
    });

    return this.toTrace(trace.toObject());
  }

  async recordStep<TOutput>(
    traceId: string,
    engine: RuntimeTraceStepEngine,
    callback: () => Promise<TOutput> | TOutput,
    input?: unknown,
  ): Promise<TOutput> {
    const startedAt = new Date();

    try {
      const output = await callback();
      const finishedAt = new Date();
      await this.appendStep(traceId, {
        engine,
        status: 'SUCCESS',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        input,
        output,
      });
      return output;
    } catch (error) {
      const finishedAt = new Date();
      await this.appendStep(traceId, {
        engine,
        status: 'FAILED',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        input,
        error: this.serializeError(error),
      });
      throw error;
    }
  }

  async complete(traceId: string): Promise<void> {
    await this.finish(traceId, 'SUCCESS');
  }

  async fail(traceId: string, error: unknown): Promise<void> {
    await this.finish(traceId, 'FAILED', this.serializeError(error));
  }

  async findOne(context: RuntimeContext, id: string): Promise<RuntimeTrace> {
    const trace = await this.model
      .findOne({
        _id: id,
        ...this.createScope(context),
      })
      .lean()
      .exec();

    if (!trace) {
      throw new NotFoundException('Runtime trace was not found.');
    }

    return this.toTrace(trace);
  }

  async findMany(context: RuntimeContext, filter: RuntimeTraceFilter = {}): Promise<RuntimeTrace[]> {
    const traces = await this.model
      .find({
        ...this.createScope(context),
        ...(filter.entityCode ? { entityCode: filter.entityCode } : {}),
        ...(filter.documentId ? { documentId: filter.documentId } : {}),
        ...(filter.actionCode ? { actionCode: filter.actionCode } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      })
      .sort({ startedAt: -1 })
      .limit(100)
      .lean()
      .exec();

    return traces.map((trace) => this.toTrace(trace));
  }

  private async appendStep(traceId: string, step: RuntimeTraceStep): Promise<void> {
    await this.model
      .findByIdAndUpdate(traceId, {
        $push: {
          steps: step,
        },
      })
      .exec();
  }

  private async finish(traceId: string, status: RuntimeTraceStatus, error?: unknown): Promise<void> {
    const trace = await this.model.findById(traceId).lean().exec();

    if (!trace) {
      throw new NotFoundException('Runtime trace was not found.');
    }

    const finishedAt = new Date();
    await this.model
      .findByIdAndUpdate(traceId, {
        $set: {
          status,
          finishedAt,
          durationMs: finishedAt.getTime() - new Date(trace.startedAt).getTime(),
          ...(error ? { error } : {}),
        },
      })
      .exec();
  }

  private createScope(context: RuntimeContext): Record<string, string> {
    return {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
    };
  }

  private serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return {
      message: String(error),
    };
  }

  private toTrace(record: RuntimeTraceRecord): RuntimeTrace {
    return {
      id: String(record._id ?? record.id ?? ''),
      tenantId: record.tenantId,
      domainCode: record.domainCode,
      applicationCode: record.applicationCode,
      entityCode: record.entityCode,
      documentId: record.documentId,
      actionCode: record.actionCode,
      status: record.status,
      startedAt: record.startedAt,
      finishedAt: record.finishedAt,
      durationMs: record.durationMs,
      steps: record.steps,
    };
  }
}
