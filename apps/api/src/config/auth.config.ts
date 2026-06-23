import { registerAs } from '@nestjs/config';

export type AuthMode = 'header' | 'jwt';

export interface AuthConfig {
  mode: AuthMode;
  jwtSecret: string;
  jwtExpiresIn: string;
  defaultDomainCode: string;
  defaultApplicationCode: string;
}

export const authConfig = registerAs<AuthConfig>('auth', () => ({
  mode: (process.env.AUTH_MODE ?? 'header') as AuthMode,
  jwtSecret: process.env.JWT_SECRET ?? 'redios-dev-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  defaultDomainCode: process.env.REDIOS_DEFAULT_DOMAIN_CODE ?? 'DEFAULT',
  defaultApplicationCode: process.env.REDIOS_DEFAULT_APPLICATION_CODE ?? 'ASSET_MAINTENANCE',
}));
