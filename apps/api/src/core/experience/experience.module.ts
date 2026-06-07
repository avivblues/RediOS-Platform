import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { ExperienceEngine } from './experience-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [ExperienceEngine],
  exports: [ExperienceEngine],
})
export class ExperienceModule {}
