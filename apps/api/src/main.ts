import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('RediOS');
  const port = configService.get<number>('PORT', 3000);

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('RediOS Runtime Kernel')
    .setDescription('Generic metadata-driven runtime API.')
    .setVersion('0.1')
    .addBearerAuth()
    .addGlobalParameters(
      {
        name: 'x-tenant-id',
        in: 'header',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'x-domain-code',
        in: 'header',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'x-application-code',
        in: 'header',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'x-user-id',
        in: 'header',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'x-permissions',
        in: 'header',
        required: false,
        schema: { type: 'string' },
        description: 'Comma-separated metadata permission codes resolved by the Security Engine.',
      },
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(port);
  logger.log(`Runtime kernel API listening on port ${port}`);
}

void bootstrap();
