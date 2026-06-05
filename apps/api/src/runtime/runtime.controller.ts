import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { RuntimeHeaders } from '../core/context/context.engine';
import { RuntimeCreateDto } from './dto/runtime-create.dto';
import { RuntimeUpdateDto } from './dto/runtime-update.dto';
import { RuntimeService } from './runtime.service';

@ApiTags('Runtime')
@Controller('runtime')
export class RuntimeController {
  constructor(private readonly runtimeService: RuntimeService) {}

  @Post(':entityCode')
  @ApiOperation({ summary: 'Create a runtime document from metadata.' })
  @ApiParam({ name: 'entityCode', description: 'Metadata entity code.' })
  @ApiBody({ type: RuntimeCreateDto })
  create(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Body() payload: RuntimeCreateDto,
  ) {
    return this.runtimeService.create(headers, entityCode, payload);
  }

  @Get(':entityCode')
  @ApiOperation({ summary: 'Find runtime documents by metadata entity.' })
  @ApiParam({ name: 'entityCode', description: 'Metadata entity code.' })
  findMany(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Query() query: Record<string, unknown>,
  ) {
    return this.runtimeService.findMany(headers, entityCode, query);
  }

  @Get(':entityCode/:id')
  @ApiOperation({ summary: 'Find one runtime document by id.' })
  @ApiParam({ name: 'entityCode', description: 'Metadata entity code.' })
  @ApiParam({ name: 'id', description: 'Runtime document id.' })
  findOne(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Param('id') id: string,
  ) {
    return this.runtimeService.findOne(headers, entityCode, id);
  }

  @Patch(':entityCode/:id')
  @ApiOperation({ summary: 'Update runtime document data.' })
  @ApiParam({ name: 'entityCode', description: 'Metadata entity code.' })
  @ApiParam({ name: 'id', description: 'Runtime document id.' })
  @ApiBody({ type: RuntimeUpdateDto })
  update(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Param('id') id: string,
    @Body() payload: RuntimeUpdateDto,
  ) {
    return this.runtimeService.update(headers, entityCode, id, payload);
  }

  @Post(':entityCode/:id/actions/:actionCode')
  @ApiOperation({ summary: 'Run metadata action through workflow and process planning.' })
  @ApiParam({ name: 'entityCode', description: 'Metadata entity code.' })
  @ApiParam({ name: 'id', description: 'Runtime document id.' })
  @ApiParam({ name: 'actionCode', description: 'Metadata action code.' })
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
