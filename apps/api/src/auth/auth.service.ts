import { Injectable } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { IdentityEngineService } from '../core/identity/identity-engine.service';
import type { LoginResult, MeResult } from '../core/identity/identity.types';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly identityEngine: IdentityEngineService,
    private readonly contextEngine: ContextEngine,
  ) {}

  login(dto: LoginDto): Promise<LoginResult> {
    return this.identityEngine.login({
      email: dto.email,
      password: dto.password,
      domainCode: dto.domainCode,
      applicationCode: dto.applicationCode,
    });
  }

  me(headers: RuntimeHeaders): Promise<MeResult> {
    const context = this.contextEngine.resolve(headers);
    return this.identityEngine.getProfile(context);
  }
}
