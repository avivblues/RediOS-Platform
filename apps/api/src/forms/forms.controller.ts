import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { FormEngine, type ComposedForm } from '../core/form/form-engine.service';

@Controller('forms')
export class FormsController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly formEngine: FormEngine,
  ) {}

  @Get(':entityCode')
  compose(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Query('formCode') formCode?: string,
  ): Promise<ComposedForm> {
    return this.formEngine.compose(this.contextEngine.resolve(headers), entityCode, formCode);
  }
}
