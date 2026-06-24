import type { MetadataDefinition } from '@redios/shared';
import { readAuthSession, buildAuthHeaders, redirectToLoginIfUnauthorized } from '../../auth/session';
import type { GeneratedMetadataPublishResult } from '../../core/api/designer-client';
import {
  buildApplicationPackageFromStore,
  resolveStudioPublishContext,
  studioPackageToMetadata,
  type StudioPublishContext,
} from './studio-metadata-publisher';
import {
  loadActions,
  loadCustomApis,
  loadCustomOrganisms,
  loadDataObjects,
  loadMenu,
  loadProcesses,
  loadQueries,
  loadScreenCanvases,
  loadScreens,
  loadSecurity,
  publishApplicationPackage,
  resolveActiveApplicationCode,
  type StudioApplicationMetadataPackage,
} from '../metadata/metadata-store';
import type { StudioTarget } from '../builder/types';

const API_BASE_URL = import.meta.env.VITE_REDIOS_API_URL ?? '/api';

export async function publishMetadataToKernel(
  metadata: MetadataDefinition[],
): Promise<GeneratedMetadataPublishResult> {
  const response = await fetch(`${API_BASE_URL}/designer/generated/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ metadata }),
  });

  if (!response.ok) {
    if (redirectToLoginIfUnauthorized(response)) {
      throw new Error('Session expired. Please sign in again.');
    }

    let message = 'Kernel publish failed.';
    try {
      const body = await response.json() as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? message);
    } catch {
      message = await response.text().catch(() => message);
    }

    throw new Error(message);
  }

  return response.json() as Promise<GeneratedMetadataPublishResult>;
}

export async function publishStudioPackage(
  pkg: StudioApplicationMetadataPackage,
  applicationCode = pkg.appCode,
): Promise<GeneratedMetadataPublishResult> {
  const session = readAuthSession();
  const context = resolveStudioPublishContext(applicationCode, session);
  const metadata = studioPackageToMetadata(pkg, context);

  publishApplicationPackage(pkg);

  if (metadata.length === 0) {
    throw new Error('No metadata records to publish.');
  }

  return publishMetadataToKernel(metadata);
}

export async function publishActiveApplicationFromStore(
  target: StudioTarget = 'web',
  applicationCode = resolveActiveApplicationCode(target),
): Promise<GeneratedMetadataPublishResult> {
  const screens = loadScreens(applicationCode);
  const screenCanvases = loadScreenCanvases(applicationCode, screens);
  const activeCanvas = screenCanvases[screens[0]?.code ?? ''] ?? [];

  const pkg = buildApplicationPackageFromStore(applicationCode, target, {
    dataObjects: loadDataObjects(applicationCode),
    queries: loadQueries(applicationCode),
    actions: loadActions(applicationCode),
    connectors: loadCustomApis(applicationCode),
    processes: loadProcesses(applicationCode),
    menu: loadMenu(applicationCode),
    screens,
    security: loadSecurity(applicationCode),
    customOrganisms: loadCustomOrganisms(applicationCode),
    theme: { name: 'Studio Theme', tokens: {} },
    canvas: activeCanvas,
    screenCanvases,
  });

  return publishStudioPackage(pkg, applicationCode);
}

export function formatPublishResult(result: GeneratedMetadataPublishResult): string {
  const packages = result.runtimePackages?.map((item) => `${item.applicationCode}:${item.status}`).join(', ') ?? 'compiled';
  return `Published ${result.published.length} record(s). Runtime: ${packages}.`;
}

export function publishContextLabel(context: StudioPublishContext): string {
  return `${context.applicationCode}@${context.tenantId}`;
}
