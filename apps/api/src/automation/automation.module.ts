import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { TunasflowModule } from '../core/tunasflow/tunasflow.module';
import { AutomationController } from './automation.controller';

@Module({
  imports: [ContextModule, TunasflowModule],
  controllers: [AutomationController],
})
export class AutomationModule {}
