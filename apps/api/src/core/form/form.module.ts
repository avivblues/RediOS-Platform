import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { RelationModule } from '../relation/relation.module';
import { FormEngine } from './form-engine.service';

@Module({
  imports: [MetadataModule, RelationModule],
  providers: [FormEngine],
  exports: [FormEngine],
})
export class FormModule {}
