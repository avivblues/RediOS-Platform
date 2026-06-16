import { NestFactory } from '@nestjs/core';
import { PlatformSeedRunner } from './platform-seed.runner';
import { SeedModule } from './seed.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const runner = app.get(PlatformSeedRunner);

  await runner.run();
  await app.close();
}

void bootstrap();
