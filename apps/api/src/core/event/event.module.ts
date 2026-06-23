import { Module } from '@nestjs/common';
import { ExperienceModule as CoreExperienceModule } from '../experience/experience.module';
import { IntegrationModule } from '../integration/integration.module';
import { MetadataModule } from '../metadata/metadata.module';
import { StorageModule } from '../storage/storage.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { EventBus } from './event.bus';
import { EventEngine } from './event-engine.service';
import { EventSubscriberRegistry, eventBusProviders } from './event.subscriber';

@Module({
  imports: [MetadataModule, IntegrationModule, WorkflowModule, StorageModule, CoreExperienceModule],
  providers: eventBusProviders,
  exports: [EventEngine, EventBus],
})
export class EventModule {}
