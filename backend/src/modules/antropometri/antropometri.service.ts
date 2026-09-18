import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AntropometriPengukuran } from '../../entities/antropometri-pengukuran.entity';
import { Pasien } from '../../entities/pasien.entity';
import { Kunjungan } from '../../entities/kunjungan.entity';
import { AntrianLog } from '../../entities/antrian-log.entity';
import { CreateAntropometriDto } from './dto/create-antropometri.dto';
import { hitungZScoreWHO } from './who-standards';

@Injectable()
export class AntropometriService {
  constructor(
    @InjectRepository(AntropometriPengukuran)
    private antropometriRepository: Repository<AntropometriPengukuran>,
    @InjectRepository(Pasien)
    private pasienRepository: Repository<Pasien>,
    @InjectRepository(Kunjungan)
    private kunjunganRepository: Repository<Kunjungan>,
    @InjectRepository(AntrianLog)
    private antrianLogRepository: Repository<AntrianLog>,
  ) {}

  async create(dto: CreateAntropometriDto, diukurOlehUserId?: number) {
    const pasien = await this.pasienRepository.findOne({
      where: { id: dto.pasien_id },
    });

    if (!pasien) {
      throw new NotFoundException(`Pasien dengan id ${dto.pasien_id} tidak ditemukan`);
    }

    const kunjungan = await this.kunjunganRepository.findOne({
      where: { id: dto.kunjungan_id },
    });

    if (!kunjungan) {
      throw new NotFoundException(`Kunjungan dengan id ${dto.kunjungan_id} tidak ditemukan`);
    }

    // Hitung z-score dan interpretasi WHO
    const hasilWHO = hitungZScoreWHO({
      jenisKelamin: pasien.jenis_kelamin,
      usiaBulan: dto.usia_bulan,
      beratBadanKg: dto.berat_badan_kg,
      tinggiBadanCm: dto.tinggi_badan_cm,
      lingkarKepalaCm: dto.lingkar_kepala_cm,
    });

    const entity = new AntropometriPengukuran();
    entity.kunjungan_id = dto.kunjungan_id;
    entity.pasien_id = dto.pasien_id;
    entity.diukur_oleh_user_id = diukurOlehUserId;
    entity.usia_bulan = dto.usia_bulan;
    entity.berat_badan_kg = dto.berat_badan_kg;
    entity.tinggi_badan_cm = dto.tinggi_badan_cm;
    entity.lingkar_kepala_cm = dto.lingkar_kepala_cm;
    entity.z_score_bb_u = hasilWHO.z_score_bb_u;
    entity.z_score_tb_u = hasilWHO.z_score_tb_u;
    entity.z_score_bb_tb = hasilWHO.z_score_bb_tb;
    entity.z_score_lk_u = hasilWHO.z_score_lk_u ?? undefined;
    entity.interpretasi = hasilWHO.interpretasi;

    const saved = await this.antropometriRepository.save(entity);

    // Otomatisasi alur perawat: Kunjungan status 'putih' otomatis maju ke 'hijau' (sudah ditimbang)
    if (kunjungan.status_antrian === 'putih') {
      kunjungan.status_antrian = 'hijau';
      if (diukurOlehUserId) kunjungan.perawat_user_id = diukurOlehUserId;
      kunjungan.updated_at = new Date();
      await this.kunjunganRepository.save(kunjungan);

      const log = this.antrianLogRepository.create({
        kunjungan_id: kunjungan.id,
        status_dari: 'putih',
        status_ke: 'hijau',
        diubah_oleh_user_id: diukurOlehUserId ?? null,
        waktu: new Date(),
      });
      await this.antrianLogRepository.save(log);
    }

    return {
      id: saved.id,
      kunjungan_id: saved.kunjungan_id,
      pasien_id: saved.pasien_id,
      diukur_oleh_user_id: saved.diukur_oleh_user_id,
      usia_bulan: saved.usia_bulan,
      berat_badan_kg: Number(saved.berat_badan_kg),
      tinggi_badan_cm: Number(saved.tinggi_badan_cm),
      lingkar_kepala_cm: saved.lingkar_kepala_cm ? Number(saved.lingkar_kepala_cm) : undefined,
      z_score_bb_u: saved.z_score_bb_u !== null && saved.z_score_bb_u !== undefined ? Number(saved.z_score_bb_u) : undefined,
      z_score_tb_u: saved.z_score_tb_u !== null && saved.z_score_tb_u !== undefined ? Number(saved.z_score_tb_u) : undefined,
      z_score_bb_tb: saved.z_score_bb_tb !== null && saved.z_score_bb_tb !== undefined ? Number(saved.z_score_bb_tb) : undefined,
      z_score_lk_u: saved.z_score_lk_u !== null && saved.z_score_lk_u !== undefined ? Number(saved.z_score_lk_u) : undefined,
      interpretasi: saved.interpretasi,
      created_at: saved.created_at ? new Date(saved.created_at).toISOString() : new Date().toISOString(),
    };
  }

  async findByKunjunganId(kunjunganId: number) {
    const list = await this.antropometriRepository.find({
      where: { kunjungan_id: kunjunganId },
      order: { created_at: 'DESC' },
    });

    return list.map((item) => ({
      id: item.id,
      kunjungan_id: item.kunjungan_id,
      pasien_id: item.pasien_id,
      diukur_oleh_user_id: item.diukur_oleh_user_id,
      usia_bulan: item.usia_bulan,
      berat_badan_kg: Number(item.berat_badan_kg),
      tinggi_badan_cm: Number(item.tinggi_badan_cm),
      lingkar_kepala_cm: item.lingkar_kepala_cm ? Number(item.lingkar_kepala_cm) : undefined,
      z_score_bb_u: item.z_score_bb_u !== null && item.z_score_bb_u !== undefined ? Number(item.z_score_bb_u) : undefined,
      z_score_tb_u: item.z_score_tb_u !== null && item.z_score_tb_u !== undefined ? Number(item.z_score_tb_u) : undefined,
      z_score_bb_tb: item.z_score_bb_tb !== null && item.z_score_bb_tb !== undefined ? Number(item.z_score_bb_tb) : undefined,
      z_score_lk_u: item.z_score_lk_u !== null && item.z_score_lk_u !== undefined ? Number(item.z_score_lk_u) : undefined,
      interpretasi: item.interpretasi,
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    }));
  }
}
