import { Module } from '@nestjs/common';
import { ActionModule } from '../action/action.module';
import { MetadataModule } from '../metadata/metadata.module';
import { RelationModule } from '../relation/relation.module';
import { SecurityModule } from '../security/security.module';
import { SecurityPolicyModule } from '../security-policy/security-policy.module';
import { StorageModule } from '../storage/storage.module';
import { FieldSecurityEngine } from './field-security-engine.service';
import { QueryEngine } from './query-engine.service';

@Module({
  imports: [MetadataModule, StorageModule, RelationModule, ActionModule, SecurityModule, SecurityPolicyModule],
  providers: [QueryEngine, FieldSecurityEngine],
  exports: [QueryEngine],
})
export class QueryModule {}
