import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import type { RuntimeTraceStatus } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { TraceEngine, type RuntimeTraceFilter } from '../core/trace/trace-engine.service';

@Controller('runtime-traces')
export class RuntimeTracesController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly traceEngine: TraceEngine,
  ) {}

  @Get()
  findMany(@Headers() headers: RuntimeHeaders, @Query() query: Record<string, string | undefined>) {
    const context = this.contextEngine.resolve(headers);
    return this.traceEngine.findMany(context, this.toFilter(query));
  }

  @Get(':id')
  findOne(@Headers() headers: RuntimeHeaders, @Param('id') id: string) {
    const context = this.contextEngine.resolve(headers);
    return this.traceEngine.findOne(context, id);
  }

  private toFilter(query: Record<string, string | undefined>): RuntimeTraceFilter {
    return {
      entityCode: query.entityCode,
      documentId: query.documentId,
      actionCode: query.actionCode,
      status: this.toStatus(query.status),
    };
  }

  private toStatus(status: string | undefined): RuntimeTraceStatus | undefined {
    if (status === 'RUNNING' || status === 'SUCCESS' || status === 'FAILED') {
      return status;
    }

    return undefined;
  }
}
