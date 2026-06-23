import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { RuntimeContext } from '@redios/shared';
import { Model } from 'mongoose';
import type { AuthConfig } from '../../config/auth.config';
import { PLATFORM_ROLE_MODEL } from '../../platform/domain/schemas/platform-role.schema';
import { PLATFORM_USER_MODEL } from '../../platform/domain/schemas/platform-user.schema';
import { verifyPlatformPassword } from '../../platform/password.util';
import type { AuthenticatedUser, IdentityJwtPayload, LoginResult, MeResult } from './identity.types';
import { JwtTokenService } from './jwt-token.service';

export interface LoginInput {
  email: string;
  password: string;
  domainCode?: string;
  applicationCode?: string;
}

@Injectable()
export class IdentityEngineService {
  constructor(
    @InjectModel(PLATFORM_USER_MODEL) private readonly userModel: Model<Record<string, unknown>>,
    @InjectModel(PLATFORM_ROLE_MODEL) private readonly roleModel: Model<Record<string, unknown>>,
    private readonly jwtTokenService: JwtTokenService,
    private readonly configService: ConfigService,
  ) {}

  async login(input: LoginInput): Promise<LoginResult> {
    const user = await this.authenticate(input.email, input.password);
    const auth = this.configService.getOrThrow<AuthConfig>('auth');
    const roles = user.roleCodes;
    const permissions = await this.resolvePermissions(roles);
    const domainCode = input.domainCode ?? auth.defaultDomainCode;
    const applicationCode = input.applicationCode ?? auth.defaultApplicationCode;

    const payload: IdentityJwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      domainCode,
      applicationCode,
      roles,
      permissions,
      displayName: user.displayName,
    };

    const accessToken = this.jwtTokenService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtTokenService.expiresIn(),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles,
      },
      context: this.toRuntimeContext(payload),
    };
  }

  async getProfile(context: RuntimeContext): Promise<MeResult> {
    const record = await this.userModel.findById(context.userId).lean().exec();

    if (!record) {
      throw new UnauthorizedException('User not found.');
    }

    const roles = Array.isArray(record.roleCodes)
      ? record.roleCodes.map(String)
      : (context.roles ?? []);

    return {
      user: {
        id: String(record.id),
        email: String(record.email),
        displayName: String(record.displayName ?? record.email ?? 'User'),
        status: String(record.status ?? 'ACTIVE'),
        roles,
      },
      context,
    };
  }

  async authenticate(email: string, password: string): Promise<AuthenticatedUser> {
    const normalizedEmail = email.trim().toLowerCase();
    const record = await this.userModel.findOne({ email: normalizedEmail }).lean().exec();

    if (!record) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordHash = String(record.passwordHash ?? '');
    if (!verifyPlatformPassword(password, passwordHash)) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (String(record.status ?? 'ACTIVE') !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active.');
    }

    return {
      id: String(record.id),
      email: String(record.email),
      displayName: String(record.displayName ?? record.email ?? 'User'),
      tenantId: String(record.tenantId),
      status: String(record.status ?? 'ACTIVE'),
      roleCodes: Array.isArray(record.roleCodes) ? record.roleCodes.map(String) : [],
    };
  }

  async resolvePermissions(roleCodes: string[]): Promise<string[]> {
    if (roleCodes.length === 0) {
      return [];
    }

    const roles = await this.roleModel.find({ code: { $in: roleCodes } }).lean().exec();
    const permissions = new Set<string>();

    for (const role of roles) {
      const entries = Array.isArray(role.permissions) ? role.permissions : [];
      for (const permission of entries) {
        permissions.add(String(permission));
      }
    }

    return Array.from(permissions);
  }

  toRuntimeContext(payload: IdentityJwtPayload): RuntimeContext {
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      domainCode: payload.domainCode,
      applicationCode: payload.applicationCode,
      permissions: payload.permissions,
      capabilities: [],
      roles: payload.roles,
      groups: [],
      attributes: {
        email: payload.email,
        displayName: payload.displayName,
      },
    };
  }
}
