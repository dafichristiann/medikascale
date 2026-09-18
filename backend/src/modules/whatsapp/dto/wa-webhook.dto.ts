import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WaWebhookDto {
  @ApiProperty({
    example: '081234567890',
    description: 'Nomor telepon pengirim WhatsApp',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    example: '1',
    description: 'Isi teks pesan masuk',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
