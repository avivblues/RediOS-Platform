import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { SecurityModule } from '../security/security.module';
import { SecurityPolicyModule } from '../security-policy/security-policy.module';
import { ThemeModule } from '../theme/theme.module';
import { NavigationEngine } from './navigation-engine.service';

@Module({
  imports: [MetadataModule, ThemeModule, SecurityModule, SecurityPolicyModule],
  providers: [NavigationEngine],
  exports: [NavigationEngine],
})
export class NavigationModule {}
