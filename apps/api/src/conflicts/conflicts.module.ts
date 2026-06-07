import { Module } from '@nestjs/common';
import { ConflictModule } from '../core/conflict/conflict.module';
import { ContextModule } from '../core/context/context.module';
import { ConflictsController } from './conflicts.controller';

@Module({
  imports: [ContextModule, ConflictModule],
  controllers: [ConflictsController],
})
export class ConflictsModule {}
