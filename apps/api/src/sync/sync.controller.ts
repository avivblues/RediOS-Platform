import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import type { ResolvedSyncPolicy } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { SyncPolicyEngine, type SyncBootstrapPackage } from '../core/sync/sync-policy-engine.service';

interface SyncBootstrapRequest {
  deviceId: string;
  metadataVersion?: number;
}

@Controller('sync')
export class SyncController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly syncPolicyEngine: SyncPolicyEngine,
  ) {}

  @Get('policies')
  policies(@Headers() headers: RuntimeHeaders): Promise<ResolvedSyncPolicy[]> {
    return this.syncPolicyEngine.resolvePolicies(this.contextEngine.resolve(headers));
  }

  @Post('bootstrap')
  bootstrap(
    @Headers() headers: RuntimeHeaders,
    @Body() _request: SyncBootstrapRequest,
  ): Promise<SyncBootstrapPackage> {
    return this.syncPolicyEngine.bootstrap(this.contextEngine.resolve(headers));
  }
}
