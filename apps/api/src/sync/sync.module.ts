import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { SyncModule as CoreSyncModule } from '../core/sync/sync.module';
import { SyncController } from './sync.controller';

@Module({
  imports: [ContextModule, CoreSyncModule],
  controllers: [SyncController],
})
export class SyncModule {}
