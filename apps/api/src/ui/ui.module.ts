import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { UIModule as CoreUIModule } from '../core/ui/ui.module';
import { UIController } from './ui.controller';

@Module({
  imports: [ContextModule, CoreUIModule],
  controllers: [UIController],
})
export class UIModule {}
