import { Module } from '@nestjs/common';
import { ContextEngine } from './context.engine';

@Module({
  providers: [ContextEngine],
  exports: [ContextEngine],
})
export class ContextModule {}
