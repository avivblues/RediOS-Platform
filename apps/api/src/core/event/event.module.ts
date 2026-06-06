import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { EventEngine } from './event-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [EventEngine],
  exports: [EventEngine],
})
export class EventModule {}
