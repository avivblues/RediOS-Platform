import { Controller, Get, Headers, Param } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { UIEngine, type ResolvedUIPage } from '../core/ui/ui-engine.service';

@Controller('ui')
export class UIController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly uiEngine: UIEngine,
  ) {}

  @Get('pages/:pageCode')
  resolvePage(
    @Headers() headers: RuntimeHeaders,
    @Param('pageCode') pageCode: string,
  ): Promise<ResolvedUIPage> {
    return this.uiEngine.resolvePage(this.contextEngine.resolve(headers), pageCode);
  }
}
