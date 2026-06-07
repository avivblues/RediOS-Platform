import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { NavigationModule } from '../navigation/navigation.module';
import { ThemeModule } from '../theme/theme.module';
import { UIEngine } from './ui-engine.service';

@Module({
  imports: [MetadataModule, ThemeModule, NavigationModule],
  providers: [UIEngine],
  exports: [UIEngine],
})
export class UIModule {}
