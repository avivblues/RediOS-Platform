import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  CapabilityDefinition,
  CapabilityExecutionRequest,
  CapabilityExecutionResult,
} from '@redios/shared';
import { Model } from 'mongoose';
import {
  CAPABILITY_DEFINITION_MODEL,
  CAPABILITY_DEFINITION_COLLECTION,
} from './schemas/capability-definition.schema';

@Injectable()
export class CapabilityRegistry {
  constructor(
    @InjectModel(CAPABILITY_DEFINITION_MODEL)
    private readonly capabilityModel: Model<CapabilityDefinition>,
  ) {}

  async list(module?: string): Promise<CapabilityDefinition[]> {
    const filter = module ? { module } : {};
    return this.capabilityModel.find(filter).sort({ module: 1, code: 1 }).lean().exec();
  }

  async getByCode(code: string): Promise<CapabilityDefinition> {
    const capability = await this.capabilityModel.findOne({ code }).lean().exec();
    if (!capability) {
      throw new NotFoundException(`Capability not found: ${code}`);
    }
    return capability;
  }

  async resolveAction(capabilityCode: string): Promise<CapabilityDefinition> {
    return this.getByCode(capabilityCode);
  }

  async execute(request: CapabilityExecutionRequest): Promise<CapabilityExecutionResult> {
    const capability = await this.getByCode(request.capabilityCode);

    if (capability.implementationStatus !== 'IMPLEMENTED') {
      return {
        capabilityCode: capability.code,
        status: 'NOT_IMPLEMENTED',
        message: `Capability ${capability.code} is registered as ${capability.implementationStatus ?? 'CONTRACT'} only.`,
      };
    }

    return {
      capabilityCode: capability.code,
      status: 'ACCEPTED',
      output: {
        handlerRef: capability.handlerRef,
        input: request.input,
      },
      message: 'Capability dispatched to domain handler.',
    };
  }

  async upsert(definition: CapabilityDefinition): Promise<void> {
    await this.capabilityModel.updateOne(
      { code: definition.code },
      { $set: definition },
      { upsert: true },
    ).exec();
  }

  collectionName(): string {
    return CAPABILITY_DEFINITION_COLLECTION;
  }
}
