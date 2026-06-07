import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { ConflictEngine, type SyncConflictRecord } from '../core/conflict/conflict-engine.service';

interface ResolveConflictRequest {
  resolution: 'USE_SERVER' | 'USE_CLIENT' | 'MERGE';
}

@Controller('conflicts')
export class ConflictsController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly conflictEngine: ConflictEngine,
  ) {}

  @Get()
  findMany(@Headers() headers: RuntimeHeaders): Promise<SyncConflictRecord[]> {
    return this.conflictEngine.findMany(this.contextEngine.resolve(headers));
  }

  @Get(':id')
  findOne(@Headers() headers: RuntimeHeaders, @Param('id') id: string): Promise<SyncConflictRecord> {
    return this.conflictEngine.findOne(this.contextEngine.resolve(headers), id);
  }

  @Post(':id/resolve')
  resolve(
    @Headers() headers: RuntimeHeaders,
    @Param('id') id: string,
    @Body() request: ResolveConflictRequest,
  ): Promise<SyncConflictRecord> {
    return this.conflictEngine.resolve(this.contextEngine.resolve(headers), id, request.resolution);
  }
}
