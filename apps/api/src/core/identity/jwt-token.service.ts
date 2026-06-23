import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthConfig } from '../../config/auth.config';
import type { IdentityJwtPayload } from './identity.types';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  sign(payload: IdentityJwtPayload): string {
    const auth = this.configService.getOrThrow<AuthConfig>('auth');
    return this.jwtService.sign(payload, {
      secret: auth.jwtSecret,
      expiresIn: auth.jwtExpiresIn,
    });
  }

  verify(token: string): IdentityJwtPayload {
    const auth = this.configService.getOrThrow<AuthConfig>('auth');

    try {
      return this.jwtService.verify<IdentityJwtPayload>(token, {
        secret: auth.jwtSecret,
      });
    } catch (error) {
      const message = error instanceof Error && error.name === 'TokenExpiredError'
        ? 'Session expired. Please sign in again.'
        : 'Invalid or expired access token.';

      throw new UnauthorizedException(message);
    }
  }

  expiresIn(): string {
    return this.configService.getOrThrow<AuthConfig>('auth').jwtExpiresIn;
  }
}
