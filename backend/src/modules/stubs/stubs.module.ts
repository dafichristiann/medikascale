import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ResepObat,
  PemeriksaanPenunjang,
  ArsipDokumen,
  ArsipTracking,
  Notifikasi,
  Kunjungan,
  AntrianLog,
} from '../../entities';
import { ArsipStubController } from './arsip.controller';
import { ResepStubController } from './resep.controller';
import { LabStubController } from './lab.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResepObat,
      PemeriksaanPenunjang,
      ArsipDokumen,
      ArsipTracking,
      Notifikasi,
      Kunjungan,
      AntrianLog,
    ]),
  ],
  controllers: [ArsipStubController, ResepStubController, LabStubController],
  exports: [TypeOrmModule],
})
export class StubsModule {}
