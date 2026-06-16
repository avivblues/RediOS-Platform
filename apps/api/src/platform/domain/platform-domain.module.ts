import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PLATFORM_APPLICATION_MODEL,
  PlatformApplicationSchema,
} from './schemas/platform-application.schema';
import {
  PLATFORM_ROLE_MODEL,
  PlatformRoleSchema,
} from './schemas/platform-role.schema';
import {
  PLATFORM_TENANT_MODEL,
  PlatformTenantSchema,
} from './schemas/tenant.schema';
import {
  PLATFORM_USER_MODEL,
  PlatformUserSchema,
} from './schemas/platform-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PLATFORM_TENANT_MODEL, schema: PlatformTenantSchema },
      { name: PLATFORM_USER_MODEL, schema: PlatformUserSchema },
      { name: PLATFORM_ROLE_MODEL, schema: PlatformRoleSchema },
      { name: PLATFORM_APPLICATION_MODEL, schema: PlatformApplicationSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PlatformDomainModule {}
