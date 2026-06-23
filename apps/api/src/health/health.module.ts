import { Module } from '@nestjs/common';
import { RootController } from '../root.controller';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController, RootController],
})
export class HealthModule {}
