import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CUSTOM_FIELD_DEFINITION_MODEL,
  CustomFieldDefinitionSchema,
} from './schemas/custom-field-definition.schema';
import {
  CUSTOM_FIELD_VALUE_MODEL,
  CustomFieldValueSchema,
} from './schemas/custom-field-value.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CUSTOM_FIELD_DEFINITION_MODEL, schema: CustomFieldDefinitionSchema },
      { name: CUSTOM_FIELD_VALUE_MODEL, schema: CustomFieldValueSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ExtensionModule {}
