import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAntropometriDto {
  @ApiProperty({ example: 103 })
  @IsNumber()
  @IsNotEmpty()
  kunjungan_id: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsNotEmpty()
  pasien_id: number;

  @ApiProperty({ example: 18 })
  @IsNumber()
  @IsNotEmpty()
  usia_bulan: number;

  @ApiProperty({ example: 10.2 })
  @IsNumber()
  @IsNotEmpty()
  berat_badan_kg: number;

  @ApiProperty({ example: 79.5 })
  @IsNumber()
  @IsNotEmpty()
  tinggi_badan_cm: number;

  @ApiProperty({ example: 45.8, required: false })
  @IsNumber()
  @IsOptional()
  lingkar_kepala_cm?: number;
}
