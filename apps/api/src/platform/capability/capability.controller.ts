import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CapabilityRegistry } from './capability-registry.service';

@ApiTags('Capabilities')
@Controller('capabilities')
export class CapabilityController {
  constructor(private readonly capabilityRegistry: CapabilityRegistry) {}

  @Get()
  @ApiOperation({ summary: 'List registered capabilities for Builder and Runtime binding.' })
  list(@Query('module') module?: string) {
    return this.capabilityRegistry.list(module);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Resolve one capability contract by code.' })
  getByCode(@Param('code') code: string) {
    return this.capabilityRegistry.getByCode(code);
  }
}
