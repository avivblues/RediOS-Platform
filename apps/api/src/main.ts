import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('RediOS');
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  logger.log(`Runtime kernel API listening on port ${port}`);
}

void bootstrap();
