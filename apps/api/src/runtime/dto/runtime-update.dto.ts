import { ApiProperty } from '@nestjs/swagger';

export class RuntimeUpdateDto {
  @ApiProperty({
    type: Object,
    description: 'Dynamic runtime data resolved by metadata.',
    example: {
      fieldCode: 'new value',
    },
  })
  data!: Record<string, unknown>;
}
