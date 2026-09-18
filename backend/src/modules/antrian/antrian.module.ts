import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kunjungan } from '../../entities/kunjungan.entity';
import { AntrianLog } from '../../entities/antrian-log.entity';
import { AntrianService } from './antrian.service';
import { AntrianController } from './antrian.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Kunjungan, AntrianLog])],
  controllers: [AntrianController],
  providers: [AntrianService],
  exports: [AntrianService],
})
export class AntrianModule {}
