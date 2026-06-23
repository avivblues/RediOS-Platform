import { NestFactory } from '@nestjs/core';
import { MetadataCompileSeedRunner } from './metadata-compile-seed.runner';
import { MetadataSeedRunner } from './metadata-seed.runner';
import { PlatformSeedRunner } from './platform-seed.runner';
import { SeedModule } from './seed.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const platformRunner = app.get(PlatformSeedRunner);
  const metadataRunner = app.get(MetadataSeedRunner);
  const compileRunner = app.get(MetadataCompileSeedRunner);

  await platformRunner.run();
  await metadataRunner.run();
  await compileRunner.run();
  await app.close();
}

void bootstrap();
