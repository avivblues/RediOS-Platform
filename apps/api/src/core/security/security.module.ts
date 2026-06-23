import { Module } from '@nestjs/common';
import { CapabilityModule } from '../../platform/capability/capability.module';
import { SecurityEngine } from './security-engine.service';

@Module({
  imports: [CapabilityModule],
  providers: [SecurityEngine],
  exports: [SecurityEngine],
})
export class SecurityModule {}
