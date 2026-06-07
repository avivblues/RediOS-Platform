import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { QueryModule as CoreQueryModule } from '../core/query/query.module';
import { QueryController } from './query.controller';

@Module({
  imports: [ContextModule, CoreQueryModule],
  controllers: [QueryController],
})
export class QueryModule {}
