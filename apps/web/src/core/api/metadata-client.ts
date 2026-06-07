import type { MetadataDefinition, MetadataType, RuntimePackageDefinition } from '@redios/shared';
import type { RuntimeForm, RuntimeNavigation, RuntimeTheme, ResolvedUIPage } from '../renderer/runtime-types';
import type { ApiClient } from './api-client';

export interface MetadataDebugTree {
  applications: string[];
  entities: string[];
  actions: string[];
  workflows: string[];
  processes: string[];
  business: string[];
  events: string[];
  relations: string[];
  views: string[];
  ui: string[];
  forms: string[];
  themes: string[];
  navigation: string[];
  securityPolicies: string[];
  integrations: string[];
  connectors: string[];
  runtimePackages: string[];
  experiences: string[];
  syncPolicies: string[];
  conflictPolicies: string[];
  counts: Partial<Record<MetadataType, number>>;
}

export class MetadataClient {
  constructor(private readonly api: ApiClient) {}

  getMetadataTree(): Promise<MetadataDebugTree> {
    return this.api.get('/metadata/debug');
  }

  getMetadata<TDefinition>(type: MetadataType, code: string): Promise<MetadataDefinition<TDefinition>> {
    return this.api.get(`/metadata/${type}/${code}`);
  }

  getTheme(): Promise<RuntimeTheme> {
    return this.api.get('/themes/current');
  }

  getNavigation(): Promise<RuntimeNavigation> {
    return this.api.get('/navigation/current');
  }

  getForm(entityCode: string): Promise<RuntimeForm> {
    return this.api.get(`/forms/${entityCode}`);
  }

  getPage(pageCode: string): Promise<ResolvedUIPage> {
    return this.api.get(`/ui/pages/${pageCode}`);
  }

  getRuntimePackage(): Promise<MetadataDefinition<RuntimePackageDefinition> | null> {
    return this.api.get('/runtime-package/current');
  }
}
