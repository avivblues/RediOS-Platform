import { Module } from '@nestjs/common';
import { DependencyModule } from '../dependency/dependency.module';
import { MetadataModule } from '../metadata/metadata.module';
import { RuntimeCompiler } from './runtime-compiler.service';
import { RuntimePackageProvider } from './runtime-package-provider.service';
import { NoopRuntimeProjectionProvider } from './runtime-projection-provider.interface';

@Module({
  imports: [MetadataModule, DependencyModule],
  providers: [RuntimeCompiler, RuntimePackageProvider, NoopRuntimeProjectionProvider],
  exports: [RuntimeCompiler, RuntimePackageProvider, NoopRuntimeProjectionProvider],
})
export class CompilerModule {}
