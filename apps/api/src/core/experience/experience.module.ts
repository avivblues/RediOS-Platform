import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetadataModule } from '../metadata/metadata.module';
import { StorageModule } from '../storage/storage.module';
import { ActionQueueService } from './action-center/action.queue';
import { ExperienceEngine } from './experience-engine.service';
import { ExperienceRuntimeService } from './experience-runtime.service';
import { HumanTaskBridgeService } from './human-task/human-task-bridge.service';
import { HumanTaskEngine } from './human-task/human-task.engine';
import { HumanTaskProcessService } from './human-task/human-task-process.service';
import {
  EXPERIENCE_HUMAN_TASK_MODEL,
  ExperienceHumanTaskSchema,
} from './human-task/schemas/experience-human-task.schema';
import { InboxEngine } from './inbox/inbox.engine';
import { NotificationCenterService } from './notification/notification-center.service';
import { NotificationStreamService } from './notification/notification-stream.service';
import {
  EXPERIENCE_NOTIFICATION_MODEL,
  ExperienceNotificationSchema,
} from './notification/schemas/experience-notification.schema';
import { PersonaCapabilityService } from './persona/persona-capability.service';
import { PersonaResolver } from './persona/persona.resolver';
import { WorkspaceEngine } from './workspace/workspace.engine';
import { WorkspaceMetadataService } from './workspace/workspace-metadata.service';

@Module({
  imports: [
    MetadataModule,
    StorageModule,
    MongooseModule.forFeature([
      {
        name: EXPERIENCE_NOTIFICATION_MODEL,
        schema: ExperienceNotificationSchema,
      },
      {
        name: EXPERIENCE_HUMAN_TASK_MODEL,
        schema: ExperienceHumanTaskSchema,
      },
    ]),
  ],
  providers: [
    ExperienceEngine,
    ExperienceRuntimeService,
    PersonaCapabilityService,
    PersonaResolver,
    WorkspaceEngine,
    WorkspaceMetadataService,
    InboxEngine,
    HumanTaskEngine,
    HumanTaskBridgeService,
    HumanTaskProcessService,
    ActionQueueService,
    NotificationCenterService,
    NotificationStreamService,
  ],
  exports: [
    ExperienceEngine,
    ExperienceRuntimeService,
    PersonaResolver,
    WorkspaceEngine,
    WorkspaceMetadataService,
    InboxEngine,
    HumanTaskEngine,
    HumanTaskBridgeService,
    HumanTaskProcessService,
    ActionQueueService,
    NotificationCenterService,
    NotificationStreamService,
  ],
})
export class ExperienceModule implements OnModuleInit {
  constructor(private readonly humanTaskBridge: HumanTaskBridgeService) {}

  onModuleInit(): void {
    void this.humanTaskBridge.seedDemoTasks({
      userId: 'seed',
      tenantId: 'demo',
      domainCode: 'DEFAULT',
      applicationCode: 'REDIOS_PLATFORM',
      permissions: [],
      capabilities: [],
      roles: [],
    });
  }
}
