import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PemeriksaanDokter,
  Kunjungan,
  AntropometriPengukuran,
  ResepObat,
  PemeriksaanPenunjang,
  ArsipDokumen,
  AntrianLog,
  Notifikasi,
} from '../../entities';
import { CreatePemeriksaanDto } from './dto/create-pemeriksaan.dto';

@Injectable()
export class KlinisService {
  constructor(
    @InjectRepository(PemeriksaanDokter)
    private pemeriksaanRepository: Repository<PemeriksaanDokter>,
    @InjectRepository(Kunjungan)
    private kunjunganRepository: Repository<Kunjungan>,
    @InjectRepository(AntropometriPengukuran)
    private antropometriRepository: Repository<AntropometriPengukuran>,
    @InjectRepository(ResepObat)
    private resepRepository: Repository<ResepObat>,
    @InjectRepository(PemeriksaanPenunjang)
    private penunjangRepository: Repository<PemeriksaanPenunjang>,
    @InjectRepository(ArsipDokumen)
    private arsipRepository: Repository<ArsipDokumen>,
    @InjectRepository(AntrianLog)
    private antrianLogRepository: Repository<AntrianLog>,
    @InjectRepository(Notifikasi)
    private notifikasiRepository: Repository<Notifikasi>,
  ) {}

  async createPemeriksaan(dto: CreatePemeriksaanDto, user: any) {
    const kunjungan = await this.kunjunganRepository.findOne({
      where: { id: dto.kunjungan_id },
      relations: { pasien: true },
    });
    if (!kunjungan) {
      throw new NotFoundException(`Kunjungan #${dto.kunjungan_id} tidak ditemukan`);
    }

    // 1. Simpan pemeriksaan dokter
    const pemeriksaan = this.pemeriksaanRepository.create({
      kunjungan_id: dto.kunjungan_id,
      dokter_user_id: user?.id,
      keluhan: dto.keluhan,
      pemeriksaan_fisik: dto.pemeriksaan_fisik,
      diagnosis: dto.diagnosis,
      catatan_terapi: dto.catatan_terapi,
    });
    const savedPemeriksaan = await this.pemeriksaanRepository.save(pemeriksaan);

    // 2. Jika ada item resep, otomatis buatkan resep_obat & notif ke apotek
    let savedResep: ResepObat | null = null;
    if (dto.resep_items && dto.resep_items.length > 0) {
      const resep = this.resepRepository.create({
        kunjungan_id: dto.kunjungan_id,
        dokter_user_id: user?.id,
        dari_user: user?.nama || 'Dokter',
        ke_user: 'Apoteker',
        isi_pesan: `Resep untuk diagnosis: ${dto.diagnosis}. ${dto.catatan_terapi || ''}`,
        resep_item: dto.resep_items,
        status: 'menunggu',
      });
      savedResep = await this.resepRepository.save(resep);

      const notifApotek = this.notifikasiRepository.create({
        role_kode: 'apoteker',
        judul: `Resep Baru: ${kunjungan.pasien.nama}`,
        pesan: `${user?.nama || 'Dokter'} menerbitkan e-resep (${dto.resep_items.length} obat) untuk ${kunjungan.pasien.nama}`,
        tipe: 'resep',
        tautan: `/resep?kunjungan_id=${kunjungan.id}`,
      });
      await this.notifikasiRepository.save(notifApotek);
    }

    // 3. Jika ada request Lab/Radiologi, simpan pemeriksaan penunjang & notifikasi
    if (dto.lab_requests && dto.lab_requests.length > 0) {
      for (const req of dto.lab_requests) {
        const penunjang = this.penunjangRepository.create({
          kunjungan_id: dto.kunjungan_id,
          tipe: req.tipe,
          jenis_pemeriksaan: req.jenis_pemeriksaan,
          diminta_oleh_user_id: user?.id,
          catatan_dokter: req.catatan,
          status: 'menunggu',
        });
        await this.penunjangRepository.save(penunjang);

        const notifLab = this.notifikasiRepository.create({
          role_kode: 'lab_radiologi',
          judul: `Permintaan ${req.tipe.toUpperCase()}: ${kunjungan.pasien.nama}`,
          pesan: `Permintaan ${req.jenis_pemeriksaan} dari ${user?.nama || 'Dokter'}`,
          tipe: 'lab',
          tautan: '/lab',
        });
        await this.notifikasiRepository.save(notifLab);
      }
    }

    // 4. Update status antrian pasien secara otomatis
    const statusAwal = kunjungan.status_antrian;
    const targetStatus = savedResep ? 'merah' : 'kuning';
    if (statusAwal !== targetStatus && (statusAwal === 'hijau' || statusAwal === 'kuning')) {
      kunjungan.status_antrian = targetStatus;
      if (user?.id) kunjungan.dpjp_user_id = user.id;
      kunjungan.updated_at = new Date();
      await this.kunjunganRepository.save(kunjungan);

      const log = this.antrianLogRepository.create({
        kunjungan_id: kunjungan.id,
        status_dari: statusAwal,
        status_ke: targetStatus,
        diubah_oleh_user_id: user?.id ?? null,
        waktu: new Date(),
      });
      await this.antrianLogRepository.save(log);
    }

    return {
      success: true,
      pemeriksaan: savedPemeriksaan,
      resep: savedResep,
      status_antrian: kunjungan.status_antrian,
    };
  }

  async getDetailKunjungan(kunjunganId: number) {
    const kunjungan = await this.kunjunganRepository.findOne({
      where: { id: kunjunganId },
      relations: { pasien: true, layanan: true, dpjp: true, perawat: true },
    });
    if (!kunjungan) {
      throw new NotFoundException(`Kunjungan #${kunjunganId} tidak ditemukan`);
    }

    const antropometri = await this.antropometriRepository.find({
      where: { kunjungan_id: kunjunganId },
      order: { created_at: 'DESC' },
    });

    const pemeriksaan = await this.pemeriksaanRepository.find({
      where: { kunjungan_id: kunjunganId },
      relations: { dokter: true },
      order: { created_at: 'DESC' },
    });

    const resep = await this.resepRepository.find({
      where: { kunjungan_id: kunjunganId },
      order: { waktu: 'ASC' },
    });

    const penunjang = await this.penunjangRepository.find({
      where: { kunjungan_id: kunjunganId },
      order: { created_at: 'DESC' },
    });

    const arsip = await this.arsipRepository.findOne({
      where: { pasien_id: kunjungan.pasien_id },
    });

    // Riwayat kunjungan terdahulu pasien
    const riwayatKunjungan = await this.kunjunganRepository.find({
      where: { pasien_id: kunjungan.pasien_id },
      relations: { layanan: true },
      order: { tanggal: 'DESC', created_at: 'DESC' },
      take: 5,
    });

    return {
      kunjungan,
      pasien: kunjungan.pasien,
      antropometri: antropometri[0] || null,
      riwayat_antropometri: antropometri,
      pemeriksaan: pemeriksaan[0] || null,
      riwayat_pemeriksaan: pemeriksaan,
      resep,
      penunjang,
      arsip,
      riwayat_kunjungan: riwayatKunjungan,
    };
  }
}
