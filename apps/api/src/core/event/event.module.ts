import { Module } from '@nestjs/common';
import { IntegrationModule } from '../integration/integration.module';
import { MetadataModule } from '../metadata/metadata.module';
import { EventEngine } from './event-engine.service';

@Module({
  imports: [MetadataModule, IntegrationModule],
  providers: [EventEngine],
  exports: [EventEngine],
})
export class EventModule {}
