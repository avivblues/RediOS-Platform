import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CapabilityController } from './capability.controller';
import { CapabilityRegistry } from './capability-registry.service';
import {
  CAPABILITY_DEFINITION_MODEL,
  CapabilityDefinitionSchema,
} from './schemas/capability-definition.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CAPABILITY_DEFINITION_MODEL,
        schema: CapabilityDefinitionSchema,
      },
    ]),
  ],
  controllers: [CapabilityController],
  providers: [CapabilityRegistry],
  exports: [CapabilityRegistry],
})
export class CapabilityModule {}
