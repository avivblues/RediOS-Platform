import { ApiProperty } from '@nestjs/swagger';

export class RuntimeCreateDto {
  @ApiProperty({
    type: Object,
    description: 'Dynamic runtime data resolved by metadata.',
    example: {
      fieldCode: 'value',
      anotherFieldCode: 'value',
    },
  })
  data!: Record<string, unknown>;
}
