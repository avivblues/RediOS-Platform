import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { SyncPolicyEngine } from './sync-policy-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [SyncPolicyEngine],
  exports: [SyncPolicyEngine],
})
export class SyncModule {}
