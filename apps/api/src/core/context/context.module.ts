import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from '../identity/identity.module';
import { ContextEngine } from './context.engine';

@Module({
  imports: [ConfigModule, IdentityModule],
  providers: [ContextEngine],
  exports: [ContextEngine],
})
export class ContextModule {}
