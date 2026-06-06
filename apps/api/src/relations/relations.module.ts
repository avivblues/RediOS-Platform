import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { RelationModule } from '../core/relation/relation.module';
import { RelationsController } from './relations.controller';

@Module({
  imports: [ContextModule, RelationModule],
  controllers: [RelationsController],
})
export class RelationsModule {}
