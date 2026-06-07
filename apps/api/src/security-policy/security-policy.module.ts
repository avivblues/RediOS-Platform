import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { SecurityPolicyModule as CoreSecurityPolicyModule } from '../core/security-policy/security-policy.module';
import { SecurityPolicyController } from './security-policy.controller';

@Module({
  imports: [ContextModule, CoreSecurityPolicyModule],
  controllers: [SecurityPolicyController],
})
export class SecurityPolicyModule {}
