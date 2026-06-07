import { Module } from '@nestjs/common';
import { CompilerModule } from '../core/compiler/compiler.module';
import { ContextModule } from '../core/context/context.module';
import { RuntimePackageController } from './runtime-package.controller';

@Module({
  imports: [CompilerModule, ContextModule],
  controllers: [RuntimePackageController],
})
export class RuntimePackageModule {}
