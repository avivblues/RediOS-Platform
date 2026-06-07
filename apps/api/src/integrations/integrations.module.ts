import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { IntegrationModule } from '../core/integration/integration.module';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [ContextModule, IntegrationModule],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}
