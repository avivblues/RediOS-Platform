import { UnauthorizedException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RuntimeContext } from '@redios/shared';
import type { AuthConfig } from '../../config/auth.config';
import { IdentityEngineService } from '../identity/identity-engine.service';
import { JwtTokenService } from '../identity/jwt-token.service';

export type RuntimeHeaders = Record<string, string | string[] | undefined>;

@Injectable()
export class ContextEngine {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly identityEngine: IdentityEngineService,
  ) {}

  resolve(headers: RuntimeHeaders): RuntimeContext {
    const bearer = this.extractBearer(headers);

    if (bearer) {
      return this.fromJwt(bearer);
    }

    const auth = this.configService.getOrThrow<AuthConfig>('auth');
    if (auth.mode === 'jwt') {
      throw new UnauthorizedException('Bearer token is required when AUTH_MODE=jwt.');
    }

    return this.fromHeaders(headers);
  }

  resolveOptionalToken(token?: string, headers?: RuntimeHeaders): RuntimeContext {
    if (token) {
      return this.fromJwt(token);
    }

    if (headers) {
      return this.resolve(headers);
    }

    throw new UnauthorizedException('Authentication is required.');
  }

  fromJwt(token: string): RuntimeContext {
    const payload = this.jwtTokenService.verify(token);
    return this.identityEngine.toRuntimeContext(payload);
  }

  private fromHeaders(headers: RuntimeHeaders): RuntimeContext {
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

  private extractBearer(headers: RuntimeHeaders): string | undefined {
    const authorization = this.single(headers, 'authorization') ?? this.single(headers, 'Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }

    const token = authorization.slice('Bearer '.length).trim();
    return token || undefined;
  }

  private required(headers: RuntimeHeaders, key: string): string {
    const value = this.single(headers, key);

    if (!value) {
      throw new UnauthorizedException(`Missing required header: ${key}`);
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
