import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseConfig } from './config/database.config';
import { ActionModule } from './core/action/action.module';
import { ApplicationModule } from './core/application/application.module';
import { BusinessModule } from './core/business/business.module';
import { ContextModule } from './core/context/context.module';
import { EventModule } from './core/event/event.module';
import { LedgerModule } from './core/ledger/ledger.module';
import { MetadataModule } from './core/metadata/metadata.module';
import { ProcessModule } from './core/process/process.module';
import { QueryModule as CoreQueryModule } from './core/query/query.module';
import { RelationModule } from './core/relation/relation.module';
import { RuntimeModule as CoreRuntimeModule } from './core/runtime/runtime.module';
import { SecurityModule } from './core/security/security.module';
import { StorageModule } from './core/storage/storage.module';
import { WorkflowModule } from './core/workflow/workflow.module';
import { HealthModule } from './health/health.module';
import { KernelLoggerModule } from './logger/kernel-logger.module';
import { MetadataDebugModule } from './metadata/metadata-debug.module';
import { MetadataValidationModule } from './metadata/metadata-validation.module';
import { QueryModule } from './query/query.module';
import { RuntimeModule as RuntimeApiModule } from './runtime/runtime.module';
import { RuntimeTracesModule } from './runtime-traces/runtime-traces.module';
import { RelationsModule } from './relations/relations.module';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'dev'}`,
        `../../.env.${process.env.NODE_ENV ?? 'dev'}`,
        '.env.dev',
        '../../.env.dev',
        '.env',
        '../../.env',
      ],
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.uri'),
      }),
    }),
    KernelLoggerModule,
    HealthModule,
    MetadataDebugModule,
    MetadataValidationModule,
    QueryModule,
    RuntimeApiModule,
    RuntimeTracesModule,
    RelationsModule,
    SimulationModule,
    ContextModule,
    ApplicationModule,
    MetadataModule,
    SecurityModule,
    ActionModule,
    CoreRuntimeModule,
    WorkflowModule,
    ProcessModule,
    CoreQueryModule,
    RelationModule,
    BusinessModule,
    StorageModule,
    LedgerModule,
    EventModule,
  ],
})
export class AppModule {}
