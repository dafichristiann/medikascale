import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArsipLokasi, ArsipMap, ArsipPinjam, Pasien } from '../../entities';

@Injectable()
export class ArsipService {
  constructor(
    @InjectRepository(ArsipLokasi) private readonly lokasiRepo: Repository<ArsipLokasi>,
    @InjectRepository(ArsipMap) private readonly mapRepo: Repository<ArsipMap>,
    @InjectRepository(ArsipPinjam) private readonly pinjamRepo: Repository<ArsipPinjam>,
    @InjectRepository(Pasien) private readonly pasienRepo: Repository<Pasien>,
  ) {}

  private mapResponse(item: ArsipMap) {
    return {
      id: item.id, pasien_id: item.pasien_id, no_rm: item.pasien?.no_rm, nama_pasien: item.pasien?.nama,
      no_map: item.nomor_map, nomor_dokumen: item.nomor_dokumen, lokasi_id: item.lokasi_id,
      lantai: item.lokasi?.lantai ?? '-', ruang: item.lokasi?.ruang ?? '-', rak: item.lokasi?.rak ?? '-',
      baris: item.lokasi?.baris ?? '-', kotak: item.nomor_dokumen ?? '-', status: item.status,
    };
  }

  async findMaps(query = '') {
    const qb = this.mapRepo.createQueryBuilder('map')
      .leftJoinAndSelect('map.pasien', 'pasien')
      .leftJoinAndSelect('map.lokasi', 'lokasi')
      .orderBy('map.id', 'ASC');
    const normalized = query.trim().toLowerCase();
    if (normalized) qb.where('LOWER(map.nomor_map) LIKE :q OR LOWER(COALESCE(map.nomor_dokumen, \'\')) LIKE :q OR LOWER(pasien.no_rm) LIKE :q OR LOWER(pasien.nama) LIKE :q OR LOWER(lokasi.lantai) LIKE :q OR LOWER(lokasi.ruang) LIKE :q', { q: `%${normalized}%` });
    return (await qb.getMany()).map((item) => this.mapResponse(item));
  }

  async patients() {
    return this.pasienRepo.find({ order: { nama: 'ASC' }, select: { id: true, nama: true, no_rm: true } });
  }

  async createMap(payload: { nomor_map: string; nomor_dokumen?: string; pasien_id: number; lokasi_id?: number }) {
    if (!payload.nomor_map?.trim() || !payload.pasien_id) throw new BadRequestException('Nomor map dan pasien wajib diisi');
    const pasien = await this.pasienRepo.findOne({ where: { id: payload.pasien_id } });
    if (!pasien) throw new NotFoundException('Pasien tidak ditemukan');
    const lokasi = payload.lokasi_id ? await this.lokasiRepo.findOne({ where: { id: payload.lokasi_id, aktif: true } }) : null;
    if (payload.lokasi_id && !lokasi) throw new NotFoundException('Lokasi arsip tidak ditemukan');
    const map = await this.mapRepo.save(this.mapRepo.create({ nomor_map: payload.nomor_map.trim(), nomor_dokumen: payload.nomor_dokumen?.trim() || null, pasien_id: pasien.id, lokasi_id: lokasi?.id ?? null, status: 'tersedia' }));
    return this.mapResponse(await this.mapRepo.findOneOrFail({ where: { id: map.id } }));
  }

  async findByPatient(patientId: number) { return (await this.mapRepo.find({ where: { pasien_id: patientId } })).map((item) => this.mapResponse(item)); }

  async locations() {
    const rows = await this.lokasiRepo.find({ where: { aktif: true }, relations: { maps: true }, order: { lantai: 'ASC', ruang: 'ASC', rak: 'ASC', baris: 'ASC' } });
    return rows.map((row) => ({ id: row.id, lantai: row.lantai, ruang: row.ruang, rak: row.rak, baris: row.baris, map_count: row.maps?.length ?? 0 }));
  }

  async createLocation(payload: { lantai: string; ruang: string; rak: string; baris: string; keterangan?: string }, userId?: number) {
    if (![payload.lantai, payload.ruang, payload.rak, payload.baris].every((value) => value?.trim())) throw new BadRequestException('Alamat lokasi wajib lengkap');
    return this.lokasiRepo.save(this.lokasiRepo.create({ ...payload, created_by_user_id: userId ?? null }));
  }

  async updateLocation(id: number, payload: Partial<ArsipLokasi>) {
    const location = await this.lokasiRepo.findOne({ where: { id }, relations: { maps: true } });
    if (!location) throw new NotFoundException('Lokasi arsip tidak ditemukan');
    Object.assign(location, payload); return this.lokasiRepo.save(location);
  }

  async deleteLocation(id: number) {
    const location = await this.lokasiRepo.findOne({ where: { id }, relations: { maps: true } });
    if (!location) throw new NotFoundException('Lokasi arsip tidak ditemukan');
    if (location.maps?.length) throw new BadRequestException('Lokasi masih digunakan oleh map arsip');
    await this.lokasiRepo.remove(location); return { success: true };
  }

  async borrow(mapId: number, userId: number, keterangan: string) {
    if (!keterangan?.trim()) throw new BadRequestException('Keterangan wajib diisi');
    const map = await this.mapRepo.findOne({ where: { id: mapId } });
    if (!map) throw new NotFoundException('Map arsip tidak ditemukan');
    if (map.status === 'dipinjam') throw new BadRequestException('Map sedang dipinjam');
    map.status = 'dipinjam'; await this.mapRepo.save(map);
    return this.pinjamRepo.save(this.pinjamRepo.create({ map_id: mapId, peminjam_user_id: userId, tanggal_pinjam: new Date(), status: 'dipinjam', keterangan }));
  }

  async returnMap(mapId: number, keterangan: string) {
    if (!keterangan?.trim()) throw new BadRequestException('Keterangan wajib diisi');
    const map = await this.mapRepo.findOne({ where: { id: mapId } });
    if (!map) throw new NotFoundException('Map arsip tidak ditemukan');
    const active = await this.pinjamRepo.findOne({ where: { map_id: mapId, status: 'dipinjam' }, order: { tanggal_pinjam: 'DESC' } });
    if (!active) throw new BadRequestException('Tidak ada transaksi peminjaman aktif');
    active.status = 'dikembalikan'; active.tanggal_kembali = new Date(); active.keterangan = `${active.keterangan} | Pengembalian: ${keterangan}`;
    map.status = 'dikembalikan'; await this.mapRepo.save(map); return this.pinjamRepo.save(active);
  }

  async history() {
    const rows = await this.pinjamRepo.find({ relations: { map: true, peminjam: true }, order: { created_at: 'DESC' } });
    return rows.map((row) => ({ id: row.id, map_id: row.map_id, no_rm: row.map?.pasien?.no_rm, nama_pasien: row.map?.pasien?.nama, tindakan: row.status === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan', keterangan: row.keterangan, petugas: row.peminjam?.nama, waktu: row.tanggal_kembali ?? row.tanggal_pinjam }));
  }
}
