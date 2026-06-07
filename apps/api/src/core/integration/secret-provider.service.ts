import { Injectable } from '@nestjs/common';

@Injectable()
export class SecretProvider {
  getSecret(code: string | undefined): string | undefined {
    if (!code) {
      return undefined;
    }

    return process.env[`REDIOS_SECRET_${code}`];
  }
}
