import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Layanan } from '../../entities/layanan.entity';

@Injectable()
export class LayananService {
  constructor(
    @InjectRepository(Layanan)
    private layananRepository: Repository<Layanan>,
  ) {}

  async findAll(): Promise<Layanan[]> {
    return this.layananRepository.find({
      where: { aktif: true },
      order: { id: 'ASC' },
    });
  }
}
