import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AntropometriPengukuran } from '../../entities/antropometri-pengukuran.entity';
import { Pasien } from '../../entities/pasien.entity';
import { Kunjungan } from '../../entities/kunjungan.entity';
import { AntropometriService } from './antropometri.service';
import { AntropometriController } from './antropometri.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AntropometriPengukuran, Pasien, Kunjungan])],
  controllers: [AntropometriController],
  providers: [AntropometriService],
  exports: [AntropometriService],
})
export class AntropometriModule {}
