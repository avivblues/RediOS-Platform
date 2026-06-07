import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { ThemeEngine } from './theme-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [ThemeEngine],
  exports: [ThemeEngine],
})
export class ThemeModule {}
