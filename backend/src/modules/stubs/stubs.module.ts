import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ResepObat,
  PemeriksaanPenunjang,
  Notifikasi,
  Kunjungan,
  AntrianLog,
} from '../../entities';
import { ResepStubController } from './resep.controller';
import { LabStubController } from './lab.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResepObat,
      PemeriksaanPenunjang,
      Notifikasi,
      Kunjungan,
      AntrianLog,
    ]),
  ],
  controllers: [ResepStubController, LabStubController],
  exports: [TypeOrmModule],
})
export class StubsModule {}
