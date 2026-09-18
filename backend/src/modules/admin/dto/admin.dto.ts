import { IsNotEmpty, IsString, IsOptional, IsEmail, IsBoolean, IsNumber, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Dr. Budi Santoso, Sp.A' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ example: 'dokter_budi' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({ example: 'budi@medikascale.id' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  role_id: number;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsOptional()
  @IsString()
  no_telepon?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  aktif: boolean;
}

export class UpdateUserRoleDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  role_id: number;
}

export class UpdateRolePermissionsDto {
  @ApiProperty({ example: [1, 2, 3, 10], type: [Number] })
  @IsNumber({}, { each: true })
  permission_ids: number[];
}
