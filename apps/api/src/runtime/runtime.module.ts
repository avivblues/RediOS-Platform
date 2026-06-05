import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { RuntimeModule as CoreRuntimeModule } from '../core/runtime/runtime.module';
import { RuntimeController } from './runtime.controller';
import { RuntimeService } from './runtime.service';

@Module({
  imports: [ContextModule, CoreRuntimeModule],
  controllers: [RuntimeController],
  providers: [RuntimeService],
})
export class RuntimeModule {}
