import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    example: 'hijau',
    enum: ['putih', 'hijau', 'kuning', 'merah'],
    description: 'Status antrian baru',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['putih', 'hijau', 'kuning', 'merah'])
  status: string;
}
