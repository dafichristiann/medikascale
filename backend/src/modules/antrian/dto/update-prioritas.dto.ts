import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdatePrioritasDto {
  @ApiProperty({
    example: true,
    description: 'Menandai antrian sebagai prioritas atau tidak',
  })
  @IsBoolean()
  @IsNotEmpty()
  prioritas: boolean;
}
