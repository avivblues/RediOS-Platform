import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { UIEngine } from './ui-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [UIEngine],
  exports: [UIEngine],
})
export class UIModule {}
