import { BadRequestException, Injectable } from '@nestjs/common';
import type { RuntimeContext } from '@redios/shared';

export type RuntimeHeaders = Record<string, string | string[] | undefined>;

@Injectable()
export class ContextEngine {
  resolve(headers: RuntimeHeaders): RuntimeContext {
    return {
      userId: this.required(headers, 'x-user-id'),
      tenantId: this.required(headers, 'x-tenant-id'),
      domainCode: this.required(headers, 'x-domain-code'),
      applicationCode: this.required(headers, 'x-application-code'),
      permissions: this.list(headers, 'x-permissions'),
      capabilities: this.list(headers, 'x-capabilities'),
      roles: this.list(headers, 'x-roles'),
      groups: this.list(headers, 'x-groups'),
      attributes: this.attributes(headers, 'x-attributes'),
    };
  }

  private required(headers: RuntimeHeaders, key: string): string {
    const value = this.single(headers, key);

    if (!value) {
      throw new BadRequestException(`Missing required header: ${key}`);
    }

    return value;
  }

  private list(headers: RuntimeHeaders, key: string): string[] {
    const value = this.single(headers, key);
    return value ? value.split(',').map((entry) => entry.trim()).filter(Boolean) : [];
  }

  private single(headers: RuntimeHeaders, key: string): string | undefined {
    const value = headers[key] ?? headers[key.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }

  private attributes(headers: RuntimeHeaders, key: string): Record<string, unknown> {
    const value = this.single(headers, key);

    if (!value) {
      return {};
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return value.split(',').reduce<Record<string, string>>((attributes, entry) => {
        const [attributeKey, attributeValue] = entry.split(':');

        if (attributeKey && attributeValue) {
          attributes[attributeKey.trim()] = attributeValue.trim();
        }

        return attributes;
      }, {});
    }
  }
}
