import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CapabilityDefinition } from '@redios/shared';
import { Model } from 'mongoose';
import { CAPABILITY_DEFINITION_MODEL } from '../platform/capability/schemas/capability-definition.schema';
import { PLATFORM_APPLICATION_MODEL } from '../platform/domain/schemas/platform-application.schema';
import { PLATFORM_ROLE_MODEL } from '../platform/domain/schemas/platform-role.schema';
import { PLATFORM_TENANT_MODEL } from '../platform/domain/schemas/tenant.schema';
import { PLATFORM_USER_MODEL } from '../platform/domain/schemas/platform-user.schema';
import {
  capabilitySeedRecords,
  platformApplicationSeeds,
  platformRoleSeeds,
  platformTenantSeed,
  platformUserSeed,
} from './platform-seed.records';

@Injectable()
export class PlatformSeedRunner {
  private readonly logger = new Logger(PlatformSeedRunner.name);

  constructor(
    @InjectModel(PLATFORM_TENANT_MODEL) private readonly tenantModel: Model<Record<string, unknown>>,
    @InjectModel(PLATFORM_USER_MODEL) private readonly userModel: Model<Record<string, unknown>>,
    @InjectModel(PLATFORM_ROLE_MODEL) private readonly roleModel: Model<Record<string, unknown>>,
    @InjectModel(PLATFORM_APPLICATION_MODEL) private readonly applicationModel: Model<Record<string, unknown>>,
    @InjectModel(CAPABILITY_DEFINITION_MODEL) private readonly capabilityModel: Model<CapabilityDefinition>,
  ) {}

  async run(): Promise<void> {
    await this.upsertTenant();
    await this.upsertRoles();
    await this.upsertUser();
    await this.upsertApplications();
    await this.upsertCapabilities();

    this.logger.log('Platform domain seed completed.');
    this.logger.log(`Tenant: ${platformTenantSeed.code}`);
    this.logger.log(`Admin: ${platformUserSeed.email}`);
    this.logger.log(`Capabilities: ${capabilitySeedRecords.length}`);
  }

  private async upsertTenant(): Promise<void> {
    await this.tenantModel.updateOne({ code: platformTenantSeed.code }, { $set: platformTenantSeed }, { upsert: true }).exec();
  }

  private async upsertRoles(): Promise<void> {
    for (const role of platformRoleSeeds) {
      await this.roleModel.updateOne({ code: role.code }, { $set: role }, { upsert: true }).exec();
    }
  }

  private async upsertUser(): Promise<void> {
    await this.userModel.updateOne({ email: platformUserSeed.email }, { $set: platformUserSeed }, { upsert: true }).exec();
  }

  private async upsertApplications(): Promise<void> {
    for (const application of platformApplicationSeeds) {
      await this.applicationModel.updateOne({ code: application.code }, { $set: application }, { upsert: true }).exec();
    }
  }

  private async upsertCapabilities(): Promise<void> {
    for (const capability of capabilitySeedRecords) {
      await this.capabilityModel.updateOne({ code: capability.code }, { $set: capability }, { upsert: true }).exec();
    }
  }
}
