import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { RelationModule } from '../relation/relation.module';
import { SecurityPolicyModule } from '../security-policy/security-policy.module';
import { ThemeModule } from '../theme/theme.module';
import { FormEngine } from './form-engine.service';

@Module({
  imports: [MetadataModule, RelationModule, ThemeModule, SecurityPolicyModule],
  providers: [FormEngine],
  exports: [FormEngine],
})
export class FormModule {}
