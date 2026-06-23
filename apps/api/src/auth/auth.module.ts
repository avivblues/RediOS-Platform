import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { IdentityModule } from '../core/identity/identity.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [IdentityModule, ContextModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
