import { NestFactory } from '@nestjs/core';
import { MetadataSeedRunner } from './metadata-seed.runner';
import { SeedModule } from './seed.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const runner = app.get(MetadataSeedRunner);

  await runner.run();
  await app.close();
}

void bootstrap();
