import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateAntropometriDto {
  @ApiProperty({ example: 103 })
  @IsNumber()
  @IsNotEmpty()
  kunjungan_id: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsNotEmpty()
  pasien_id: number;

  @ApiProperty({ example: 18, description: 'Usia dalam satuan bulan (0 - 60)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Usia bulan minimal 0' })
  @Max(120, { message: 'Usia bulan maksimal 120' })
  usia_bulan: number;

  @ApiProperty({ example: 10.2, description: 'Berat badan dalam kg (0.5 - 60)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.5, { message: 'Berat badan minimal 0.5 kg' })
  @Max(60, { message: 'Berat badan maksimal 60 kg' })
  berat_badan_kg: number;

  @ApiProperty({ example: 79.5, description: 'Tinggi/panjang badan dalam cm (30 - 150)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(30, { message: 'Tinggi badan minimal 30 cm' })
  @Max(150, { message: 'Tinggi badan maksimal 150 cm' })
  tinggi_badan_cm: number;

  @ApiProperty({ example: 45.8, required: false, description: 'Lingkar kepala dalam cm (20 - 65)' })
  @IsNumber()
  @IsOptional()
  @Min(20, { message: 'Lingkar kepala minimal 20 cm' })
  @Max(65, { message: 'Lingkar kepala maksimal 65 cm' })
  lingkar_kepala_cm?: number;
}
