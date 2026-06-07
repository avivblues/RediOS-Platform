import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { ExperienceModule as CoreExperienceModule } from '../core/experience/experience.module';
import { ExperienceController } from './experience.controller';

@Module({
  imports: [ContextModule, CoreExperienceModule],
  controllers: [ExperienceController],
})
export class ExperienceModule {}
