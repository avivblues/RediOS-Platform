import { ApiProperty } from '@nestjs/swagger';

export class RuntimeUpdateDto {
  @ApiProperty({
    type: Object,
    description: 'Dynamic runtime data resolved by metadata.',
    example: {},
  })
  data!: Record<string, unknown>;
}
