import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Return RediOS kernel health status.' })
  check() {
    return {
      status: 'OK',
      platform: 'RediOS',
      kernel: true,
    };
  }
}
