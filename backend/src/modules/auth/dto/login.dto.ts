import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'dokter' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'demo123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
