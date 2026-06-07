import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { IntegrationModule } from '../core/integration/integration.module';
import { MetadataModule } from '../core/metadata/metadata.module';
import { ConnectorsController } from './connectors.controller';

@Module({
  imports: [ContextModule, IntegrationModule, MetadataModule],
  controllers: [ConnectorsController],
})
export class ConnectorsModule {}
