import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RUNTIME_TRACE_MODEL, RuntimeTraceSchema } from './schemas/runtime-trace.schema';
import { TraceEngine } from './trace-engine.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RUNTIME_TRACE_MODEL,
        schema: RuntimeTraceSchema,
      },
    ]),
  ],
  providers: [TraceEngine],
  exports: [TraceEngine],
})
export class TraceModule {}
