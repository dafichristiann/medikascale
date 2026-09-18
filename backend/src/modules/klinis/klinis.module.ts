import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KlinisController } from './klinis.controller';
import { KlinisService } from './klinis.service';
import {
  PemeriksaanDokter,
  Kunjungan,
  AntropometriPengukuran,
  ResepObat,
  PemeriksaanPenunjang,
  ArsipDokumen,
  AntrianLog,
  Notifikasi,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PemeriksaanDokter,
      Kunjungan,
      AntropometriPengukuran,
      ResepObat,
      PemeriksaanPenunjang,
      ArsipDokumen,
      AntrianLog,
      Notifikasi,
    ]),
  ],
  controllers: [KlinisController],
  providers: [KlinisService],
  exports: [KlinisService],
})
export class KlinisModule {}
