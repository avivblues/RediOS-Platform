import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { ApplicationEngine } from './application-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [ApplicationEngine],
  exports: [ApplicationEngine],
})
export class ApplicationModule {}
