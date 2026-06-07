import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DependencyModule } from '../dependency/dependency.module';
import { EventModule } from '../event/event.module';
import { FormModule } from '../form/form.module';
import { MetadataModule } from '../metadata/metadata.module';
import { SimulationModule } from '../simulation/simulation.module';
import { TraceModule } from '../trace/trace.module';
import { DesignerEngine } from './designer-engine.service';
import { DesignerPermissionGuard } from './designer-permission.guard';
import { METADATA_DRAFT_MODEL, MetadataDraftSchema } from './schemas/metadata-draft.schema';
import { METADATA_VERSION_MODEL, MetadataVersionSchema } from './schemas/metadata-version.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: METADATA_DRAFT_MODEL,
        schema: MetadataDraftSchema,
      },
      {
        name: METADATA_VERSION_MODEL,
        schema: MetadataVersionSchema,
      },
    ]),
    MetadataModule,
    FormModule,
    DependencyModule,
    SimulationModule,
    EventModule,
    TraceModule,
  ],
  providers: [DesignerEngine, DesignerPermissionGuard],
  exports: [DesignerEngine, DesignerPermissionGuard],
})
export class DesignerModule {}
