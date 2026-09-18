import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kunjungan } from '../../entities/kunjungan.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Kunjungan)
    private kunjunganRepository: Repository<Kunjungan>,
  ) {}

  async getSummary(tanggal?: string) {
    const targetTanggal = tanggal || new Date().toISOString().slice(0, 10);

    const list = await this.kunjunganRepository.find({
      where: { tanggal: targetTanggal },
      relations: { layanan: true },
    });

    const total = list.length;
    const menunggu = list.filter((k) => k.status_antrian === 'putih').length;
    const ditimbang = list.filter((k) => k.status_antrian === 'hijau').length;
    const diperiksa = list.filter((k) => k.status_antrian === 'kuning').length;
    const selesai = list.filter((k) => k.status_antrian === 'merah').length;
    const prioritas = list.filter((k) => k.prioritas).length;

    const layananMap: Record<string, number> = {};
    list.forEach((k) => {
      const nama = k.layanan?.nama || 'Lainnya';
      layananMap[nama] = (layananMap[nama] || 0) + 1;
    });

    return {
      tanggal: targetTanggal,
      total_pasien: total,
      menunggu_putih: menunggu,
      ditimbang_hijau: ditimbang,
      sedang_diperiksa_kuning: diperiksa,
      dapat_resep_merah: selesai,
      prioritas_aktif: prioritas,
      layanan_breakdown: layananMap,
    };
  }
}
