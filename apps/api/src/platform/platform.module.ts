import { Module } from '@nestjs/common';
import { CapabilityModule } from './capability/capability.module';
import { PlatformDomainModule } from './domain/platform-domain.module';
import { ExtensionModule } from './extension/extension.module';

@Module({
  imports: [PlatformDomainModule, ExtensionModule, CapabilityModule],
  exports: [PlatformDomainModule, ExtensionModule, CapabilityModule],
})
export class PlatformModule {}
