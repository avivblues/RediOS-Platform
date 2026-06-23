import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@redios.local' })
  email!: string;

  @ApiProperty({ example: 'admin123' })
  password!: string;

  @ApiPropertyOptional({ example: 'DEFAULT' })
  domainCode?: string;

  @ApiPropertyOptional({ example: 'ASSET_MAINTENANCE' })
  applicationCode?: string;
}
