import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseConfig } from './config/database.config';
import { ActionModule } from './core/action/action.module';
import { ApplicationModule } from './core/application/application.module';
import { BusinessModule } from './core/business/business.module';
import { CompilerModule as CoreCompilerModule } from './core/compiler/compiler.module';
import { ConflictModule as CoreConflictModule } from './core/conflict/conflict.module';
import { ContextModule } from './core/context/context.module';
import { DependencyModule as CoreDependencyModule } from './core/dependency/dependency.module';
import { DesignerModule as CoreDesignerModule } from './core/designer/designer.module';
import { EventModule } from './core/event/event.module';
import { ExperienceModule as CoreExperienceModule } from './core/experience/experience.module';
import { FormModule as CoreFormModule } from './core/form/form.module';
import { IntegrationModule as CoreIntegrationModule } from './core/integration/integration.module';
import { LedgerModule } from './core/ledger/ledger.module';
import { MetadataModule } from './core/metadata/metadata.module';
import { NavigationModule as CoreNavigationModule } from './core/navigation/navigation.module';
import { ProcessModule } from './core/process/process.module';
import { QueryModule as CoreQueryModule } from './core/query/query.module';
import { RelationModule } from './core/relation/relation.module';
import { RuntimeModule as CoreRuntimeModule } from './core/runtime/runtime.module';
import { SecurityModule } from './core/security/security.module';
import { SecurityPolicyModule as CoreSecurityPolicyModule } from './core/security-policy/security-policy.module';
import { StorageModule } from './core/storage/storage.module';
import { SyncModule as CoreSyncModule } from './core/sync/sync.module';
import { ThemeModule as CoreThemeModule } from './core/theme/theme.module';
import { UIModule as CoreUIModule } from './core/ui/ui.module';
import { WorkflowModule } from './core/workflow/workflow.module';
import { ConflictsModule } from './conflicts/conflicts.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { DesignerModule } from './designer/designer.module';
import { DependenciesModule } from './dependencies/dependencies.module';
import { ExperienceModule } from './experience/experience.module';
import { FormsModule } from './forms/forms.module';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { KernelLoggerModule } from './logger/kernel-logger.module';
import { MetadataDebugModule } from './metadata/metadata-debug.module';
import { MetadataValidationModule } from './metadata/metadata-validation.module';
import { NavigationModule } from './navigation/navigation.module';
import { QueryModule } from './query/query.module';
import { RuntimeModule as RuntimeApiModule } from './runtime/runtime.module';
import { RuntimePackageModule } from './runtime-package/runtime-package.module';
import { RuntimeTracesModule } from './runtime-traces/runtime-traces.module';
import { SecurityPolicyModule } from './security-policy/security-policy.module';
import { RelationsModule } from './relations/relations.module';
import { SimulationModule } from './simulation/simulation.module';
import { SyncModule } from './sync/sync.module';
import { ThemesModule } from './themes/themes.module';
import { UIModule } from './ui/ui.module';

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
    ConflictsModule,
    ConnectorsModule,
    IntegrationsModule,
    QueryModule,
    RuntimeApiModule,
    RuntimePackageModule,
    RuntimeTracesModule,
    RelationsModule,
    SimulationModule,
    UIModule,
    FormsModule,
    DesignerModule,
    DependenciesModule,
    ThemesModule,
    NavigationModule,
    SecurityPolicyModule,
    ExperienceModule,
    SyncModule,
    ContextModule,
    ApplicationModule,
    MetadataModule,
    SecurityModule,
    ActionModule,
    CoreRuntimeModule,
    CoreCompilerModule,
    CoreConflictModule,
    WorkflowModule,
    ProcessModule,
    CoreQueryModule,
    RelationModule,
    BusinessModule,
    StorageModule,
    LedgerModule,
    EventModule,
    CoreUIModule,
    CoreFormModule,
    CoreDesignerModule,
    CoreDependencyModule,
    CoreThemeModule,
    CoreNavigationModule,
    CoreSecurityPolicyModule,
    CoreExperienceModule,
    CoreIntegrationModule,
    CoreSyncModule,
  ],
})
export class AppModule {}
