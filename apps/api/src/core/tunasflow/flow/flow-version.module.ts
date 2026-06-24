import { Module } from '@nestjs/common';
import { MetadataModule } from '../../metadata/metadata.module';
import { StorageModule } from '../../storage/storage.module';
import { FlowVersionService } from './flow.version';

@Module({
  imports: [MetadataModule, StorageModule],
  providers: [FlowVersionService],
  exports: [FlowVersionService],
})
export class FlowVersionModule {}
