import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kunjungan } from '../../entities/kunjungan.entity';
import { AntrianLog } from '../../entities/antrian-log.entity';

@Injectable()
export class AntrianService {
  constructor(
    @InjectRepository(Kunjungan)
    private kunjunganRepository: Repository<Kunjungan>,
    @InjectRepository(AntrianLog)
    private antrianLogRepository: Repository<AntrianLog>,
  ) {}

  private mapKunjungan(k: Kunjungan) {
    return {
      id: k.id,
      no_kunjungan: k.no_kunjungan,
      pasien: {
        id: k.pasien?.id,
        nama: k.pasien?.nama,
        no_rm: k.pasien?.no_rm,
        jenis_kelamin: k.pasien?.jenis_kelamin,
        tanggal_lahir: k.pasien?.tanggal_lahir,
      },
      layanan: {
        id: k.layanan?.id,
        nama: k.layanan?.nama,
      },
      dpjp_user_id: k.dpjp_user_id,
      perawat_user_id: k.perawat_user_id,
      tanggal: k.tanggal,
      poli: k.poli,
      keluhan_utama: k.keluhan_utama,
      no_antrian: k.no_antrian,
      status_antrian: k.status_antrian,
      prioritas: k.prioritas,
      created_at: k.created_at ? new Date(k.created_at).toISOString() : new Date().toISOString(),
      updated_at: k.updated_at ? new Date(k.updated_at).toISOString() : new Date().toISOString(),
    };
  }

  async findByTanggal(tanggal?: string) {
    const targetTanggal = tanggal || new Date().toISOString().slice(0, 10);
    const list = await this.kunjunganRepository.find({
      where: { tanggal: targetTanggal },
      relations: { pasien: true, layanan: true },
      order: {
        prioritas: 'DESC',
        created_at: 'ASC',
      },
    });

    return list.map((k) => this.mapKunjungan(k));
  }

  async updateStatus(id: number, statusBaru: string, diubahOlehUserId?: number) {
    const kunjungan = await this.kunjunganRepository.findOne({
      where: { id },
      relations: { pasien: true, layanan: true },
    });

    if (!kunjungan) {
      throw new NotFoundException('Kunjungan tidak ditemukan');
    }

    const statusLama = kunjungan.status_antrian;

    // Validasi alur transisi status yang sah (putih <-> hijau <-> kuning <-> merah <-> selesai)
    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      putih: ['putih', 'hijau'],
      hijau: ['hijau', 'putih', 'kuning'],
      kuning: ['kuning', 'hijau', 'merah'],
      merah: ['merah', 'kuning', 'selesai'],
      selesai: ['selesai', 'merah'],
    };

    if (!ALLOWED_TRANSITIONS[statusLama]?.includes(statusBaru)) {
      throw new BadRequestException(
        `Transisi status antrian tidak valid dari "${statusLama}" ke "${statusBaru}". Urutan yang sah: putih -> hijau -> kuning -> merah.`,
      );
    }

    kunjungan.status_antrian = statusBaru;
    kunjungan.updated_at = new Date();

    const saved = await this.kunjunganRepository.save(kunjungan);

    // Catat ke antrian_log
    const log = this.antrianLogRepository.create({
      kunjungan_id: kunjungan.id,
      status_dari: statusLama,
      status_ke: statusBaru,
      diubah_oleh_user_id: diubahOlehUserId ?? null,
      waktu: new Date(),
    });
    await this.antrianLogRepository.save(log);

    return this.mapKunjungan(saved);
  }

  async updatePrioritas(id: number, prioritas: boolean) {
    const kunjungan = await this.kunjunganRepository.findOne({
      where: { id },
      relations: { pasien: true, layanan: true },
    });

    if (!kunjungan) {
      throw new NotFoundException('Kunjungan tidak ditemukan');
    }

    kunjungan.prioritas = prioritas;
    kunjungan.updated_at = new Date();

    const saved = await this.kunjunganRepository.save(kunjungan);
    return this.mapKunjungan(saved);
  }
}
