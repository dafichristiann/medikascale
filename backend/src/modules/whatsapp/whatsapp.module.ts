import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { WaSesi } from '../../entities/wa-sesi.entity';
import { WaPesanLog } from '../../entities/wa-pesan-log.entity';
import { Pasien } from '../../entities/pasien.entity';
import { Layanan } from '../../entities/layanan.entity';
import { Kunjungan } from '../../entities/kunjungan.entity';
import { AntrianLog } from '../../entities/antrian-log.entity';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { GenericWhatsAppAdapter } from './adapters/generic.adapter';
import { FonnteWhatsAppAdapter } from './adapters/fonnte.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WaSesi,
      WaPesanLog,
      Pasien,
      Layanan,
      Kunjungan,
      AntrianLog,
    ]),
    ConfigModule,
  ],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, GenericWhatsAppAdapter, FonnteWhatsAppAdapter],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
