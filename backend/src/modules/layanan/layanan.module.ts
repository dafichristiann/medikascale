import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Layanan } from '../../entities/layanan.entity';
import { LayananService } from './layanan.service';
import { LayananController } from './layanan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Layanan])],
  controllers: [LayananController],
  providers: [LayananService],
  exports: [LayananService],
})
export class LayananModule {}
