import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { DependencyModule as CoreDependencyModule } from '../core/dependency/dependency.module';
import { DependenciesController } from './dependencies.controller';

@Module({
  imports: [ContextModule, CoreDependencyModule],
  controllers: [DependenciesController],
})
export class DependenciesModule {}
