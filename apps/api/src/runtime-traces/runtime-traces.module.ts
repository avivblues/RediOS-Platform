import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { TraceModule } from '../core/trace/trace.module';
import { RuntimeTracesController } from './runtime-traces.controller';

@Module({
  imports: [ContextModule, TraceModule],
  controllers: [RuntimeTracesController],
})
export class RuntimeTracesModule {}
