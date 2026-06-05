import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseConfig } from '../config/database.config';
import { MetadataModule } from '../core/metadata/metadata.module';
import { MetadataSeedRunner } from './metadata-seed.runner';

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
  ],
  providers: [MetadataSeedRunner],
})
export class SeedModule {}
