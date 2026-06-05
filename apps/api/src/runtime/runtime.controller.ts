import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import type { RuntimeHeaders } from '../core/context/context.engine';
import { RuntimeService } from './runtime.service';

@Controller('runtime')
export class RuntimeController {
  constructor(private readonly runtimeService: RuntimeService) {}

  @Post(':entityCode')
  create(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Body() payload: unknown,
  ) {
    return this.runtimeService.create(headers, entityCode, payload);
  }

  @Get(':entityCode')
  findMany(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Query() query: Record<string, unknown>,
  ) {
    return this.runtimeService.findMany(headers, entityCode, query);
  }

  @Get(':entityCode/:id')
  findOne(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Param('id') id: string,
  ) {
    return this.runtimeService.findOne(headers, entityCode, id);
  }

  @Patch(':entityCode/:id')
  update(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Param('id') id: string,
    @Body() payload: unknown,
  ) {
    return this.runtimeService.update(headers, entityCode, id, payload);
  }

  @Post(':entityCode/:id/actions/:actionCode')
  prepareAction(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Param('id') id: string,
    @Param('actionCode') actionCode: string,
    @Body() payload: unknown,
  ) {
    return this.runtimeService.prepareAction(headers, entityCode, id, actionCode, payload);
  }
}
