import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Platform')
@Controller()
export class RootController {
  @Get()
  @ApiOperation({ summary: 'Return RediOS API entry information.' })
  info() {
    return {
      platform: 'RediOS',
      version: '0.1.0',
      docs: '/api/docs',
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      runtime: '/api/runtime/:entityCode',
    };
  }
}
