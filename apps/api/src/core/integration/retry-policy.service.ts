import { Injectable } from '@nestjs/common';
import type { IntegrationErrorPolicyDefinition } from '@redios/shared';

@Injectable()
export class RetryPolicy {
  attempts(policy: IntegrationErrorPolicyDefinition): number {
    return policy.retry ? Math.max(1, policy.maxAttempts) : 1;
  }

  delayMs(policy: IntegrationErrorPolicyDefinition): number {
    return Math.max(0, policy.delayMs ?? 0);
  }
}
