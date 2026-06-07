import { Controller, Get, Headers } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { NavigationEngine, type RuntimeNavigation } from '../core/navigation/navigation-engine.service';

@Controller('navigation')
export class NavigationController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly navigationEngine: NavigationEngine,
  ) {}

  @Get('current')
  current(@Headers() headers: RuntimeHeaders): Promise<RuntimeNavigation> {
    return this.navigationEngine.compose(this.contextEngine.resolve(headers));
  }
}
