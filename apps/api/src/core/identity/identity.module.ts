import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { AuthConfig } from '../../config/auth.config';
import { PlatformDomainModule } from '../../platform/domain/platform-domain.module';
import { IdentityEngineService } from './identity-engine.service';
import { JwtTokenService } from './jwt-token.service';

@Module({
  imports: [
    PlatformDomainModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const auth = configService.getOrThrow<AuthConfig>('auth');
        return {
          secret: auth.jwtSecret,
          signOptions: { expiresIn: auth.jwtExpiresIn },
        };
      },
    }),
  ],
  providers: [IdentityEngineService, JwtTokenService],
  exports: [IdentityEngineService, JwtTokenService],
})
export class IdentityModule {}
