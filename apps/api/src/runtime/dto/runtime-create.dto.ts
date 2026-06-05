import { ApiProperty } from '@nestjs/swagger';

export class RuntimeCreateDto {
  @ApiProperty({
    type: Object,
    description: 'Dynamic runtime data resolved by metadata.',
    example: {},
  })
  data!: Record<string, unknown>;
}
