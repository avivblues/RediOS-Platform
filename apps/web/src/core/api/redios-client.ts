import type { RuntimeContext } from '../renderer/runtime-types';
import { ApiClient, createApiClient } from './api-client';
import { DesignerClient } from './designer-client';
import { MetadataClient } from './metadata-client';
import { RuntimeClient } from './runtime-client';

export class RediOSClient {
  readonly api: ApiClient;
  readonly metadata: MetadataClient;
  readonly designer: DesignerClient;
  readonly runtime: RuntimeClient;

  constructor(context: RuntimeContext) {
    this.api = createApiClient(context);
    this.metadata = new MetadataClient(this.api);
    this.designer = new DesignerClient(this.api);
    this.runtime = new RuntimeClient(this.api);
  }
}

export function createRediOSClient(context: RuntimeContext): RediOSClient {
  return new RediOSClient(context);
}
