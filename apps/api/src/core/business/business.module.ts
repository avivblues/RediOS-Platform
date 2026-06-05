import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { BusinessEngine } from './business-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [BusinessEngine],
  exports: [BusinessEngine],
})
export class BusinessModule {}
