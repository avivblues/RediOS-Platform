import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { DesignerModule as CoreDesignerModule } from '../core/designer/designer.module';
import { DesignerController } from './designer.controller';

@Module({
  imports: [ContextModule, CoreDesignerModule],
  controllers: [DesignerController],
})
export class DesignerModule {}
