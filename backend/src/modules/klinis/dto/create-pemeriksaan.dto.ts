import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class ResepItemDto {
  @IsString()
  @IsNotEmpty()
  nama_obat: string;

  @IsString()
  @IsNotEmpty()
  aturan_pakai: string;

  @IsString()
  @IsNotEmpty()
  jumlah: string;
}

export class LabRequestDto {
  @IsString()
  @IsNotEmpty()
  tipe: 'lab' | 'radiologi';

  @IsString()
  @IsNotEmpty()
  jenis_pemeriksaan: string;

  @IsString()
  @IsOptional()
  catatan?: string;
}

export class CreatePemeriksaanDto {
  @ApiProperty({ example: 103 })
  @IsNumber()
  @IsNotEmpty()
  kunjungan_id: number;

  @ApiProperty({ example: 'Demam 3 hari naik turun, batuk kering' })
  @IsString()
  @IsOptional()
  keluhan?: string;

  @ApiProperty({ example: 'Suhu 38.2C, faring hiperemis (+), ronki (-/-)' })
  @IsString()
  @IsOptional()
  pemeriksaan_fisik?: string;

  @ApiProperty({ example: 'Faringitis Akut' })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiProperty({ example: 'Banyak minum air hangat, istirahat cukup' })
  @IsString()
  @IsOptional()
  catatan_terapi?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  resep_items?: ResepItemDto[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  lab_requests?: LabRequestDto[];
}
