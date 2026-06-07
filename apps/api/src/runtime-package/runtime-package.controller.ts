import { Controller, Get, Headers, Post } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { RuntimeCompiler } from '../core/compiler/runtime-compiler.service';
import { RuntimePackageProvider } from '../core/compiler/runtime-package-provider.service';

@Controller('runtime-package')
export class RuntimePackageController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly runtimeCompiler: RuntimeCompiler,
    private readonly runtimePackageProvider: RuntimePackageProvider,
  ) {}

  @Get('current')
  current(@Headers() headers: RuntimeHeaders) {
    return this.runtimePackageProvider.getActive(this.contextEngine.resolve(headers));
  }

  @Post('compile')
  compile(@Headers() headers: RuntimeHeaders) {
    return this.runtimeCompiler.compile(this.contextEngine.resolve(headers));
  }
}
