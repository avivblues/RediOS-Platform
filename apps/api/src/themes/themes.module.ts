import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { ThemeModule as CoreThemeModule } from '../core/theme/theme.module';
import { ThemesController } from './themes.controller';

@Module({
  imports: [ContextModule, CoreThemeModule],
  controllers: [ThemesController],
})
export class ThemesModule {}
