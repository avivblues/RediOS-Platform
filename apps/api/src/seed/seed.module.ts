import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseConfig } from '../config/database.config';
import { CompilerModule } from '../core/compiler/compiler.module';
import { MetadataModule } from '../core/metadata/metadata.module';
import { PlatformModule } from '../platform/platform.module';
import { MetadataCompileSeedRunner } from './metadata-compile-seed.runner';
import { MetadataSeedRunner } from './metadata-seed.runner';
import { PlatformSeedRunner } from './platform-seed.runner';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.uri'),
      }),
    }),
    MetadataModule,
    CompilerModule,
    PlatformModule,
  ],
  providers: [MetadataSeedRunner, PlatformSeedRunner, MetadataCompileSeedRunner],
})
export class SeedModule {}
