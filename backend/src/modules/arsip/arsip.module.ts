import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArsipLokasi, ArsipMap, ArsipPinjam, ArsipPinjamDetail, Pasien } from '../../entities';
import { ArsipService } from './arsip.service';
import { ArsipController } from './arsip.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArsipLokasi, ArsipMap, ArsipPinjam, ArsipPinjamDetail, Pasien])],
  controllers: [ArsipController],
  providers: [ArsipService],
})
export class ArsipModule {}
