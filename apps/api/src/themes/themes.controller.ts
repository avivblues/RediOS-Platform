import { Controller, Get, Headers, Param } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { ThemeEngine, type RuntimeTheme } from '../core/theme/theme-engine.service';

@Controller('themes')
export class ThemesController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly themeEngine: ThemeEngine,
  ) {}

  @Get('current')
  current(@Headers() headers: RuntimeHeaders): Promise<RuntimeTheme> {
    return this.themeEngine.compose(this.contextEngine.resolve(headers));
  }

  @Get(':themeCode')
  byCode(@Headers() headers: RuntimeHeaders, @Param('themeCode') themeCode: string): Promise<RuntimeTheme> {
    return this.themeEngine.compose(this.contextEngine.resolve(headers), themeCode);
  }
}
