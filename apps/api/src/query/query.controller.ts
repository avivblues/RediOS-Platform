import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { QueryEngine, type QueryRequest, type QueryResult } from '../core/query/query-engine.service';

@Controller('query')
export class QueryController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly queryEngine: QueryEngine,
  ) {}

  @Post(':entityCode')
  execute(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Body() request: QueryRequest,
  ): Promise<QueryResult> {
    return this.queryEngine.execute(this.contextEngine.resolve(headers), entityCode, request);
  }
}
