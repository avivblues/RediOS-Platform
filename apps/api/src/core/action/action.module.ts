import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { ActionEngine } from './action-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [ActionEngine],
  exports: [ActionEngine],
})
export class ActionModule {}
