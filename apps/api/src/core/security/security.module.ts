import { Module } from '@nestjs/common';
import { SecurityEngine } from './security-engine.service';

@Module({
  providers: [SecurityEngine],
  exports: [SecurityEngine],
})
export class SecurityModule {}
