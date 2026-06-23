import { Injectable, Logger } from '@nestjs/common';
import type { RuntimeContext } from '@redios/shared';
import { RuntimeCompiler } from '../core/compiler/runtime-compiler.service';

@Injectable()
export class MetadataCompileSeedRunner {
  private readonly logger = new Logger(MetadataCompileSeedRunner.name);

  constructor(private readonly runtimeCompiler: RuntimeCompiler) {}

  async run(): Promise<void> {
    const context: RuntimeContext = {
      userId: 'seed',
      tenantId: 'demo',
      domainCode: 'DEFAULT',
      applicationCode: 'ASSET_MAINTENANCE',
      permissions: ['*'],
      capabilities: [],
      roles: ['SYSTEM_ADMIN'],
    };

    const compiled = await this.runtimeCompiler.compile(context);
    this.logger.log(`Compiled runtime package ${compiled.definition.code} for ${context.applicationCode}.`);
  }
}
