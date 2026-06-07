import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { SecurityPolicyEngine } from './security-policy-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [SecurityPolicyEngine],
  exports: [SecurityPolicyEngine],
})
export class SecurityPolicyModule {}
