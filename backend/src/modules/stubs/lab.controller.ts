import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  RequirePermissions,
  RequireAnyPermissions,
} from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PemeriksaanPenunjang } from '../../entities/pemeriksaan-penunjang.entity';
import { Notifikasi } from '../../entities/notifikasi.entity';

@ApiTags('lab')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('lab')
export class LabStubController {
  constructor(
    @InjectRepository(PemeriksaanPenunjang)
    private labRepository: Repository<PemeriksaanPenunjang>,
    @InjectRepository(Notifikasi)
    private notifikasiRepository: Repository<Notifikasi>,
  ) {}

  @Get()
  @RequireAnyPermissions('lab.kelola', 'antrian.view')
  @ApiOperation({ summary: 'Daftar permintaan pemeriksaan lab & radiologi' })
  async getLab() {
    const list = await this.labRepository.find({
      relations: { kunjungan: { pasien: true }, diminta_oleh: true },
      order: { created_at: 'DESC' },
    });

    return list.map((item) => ({
      id: item.id,
      kunjungan_id: item.kunjungan_id,
      tipe: item.tipe,
      pasien: {
        no_rm: item.kunjungan?.pasien?.no_rm || 'RM-UNKNOWN',
        nama: item.kunjungan?.pasien?.nama || 'Pasien',
      },
      pemeriksaan: item.jenis_pemeriksaan,
      diminta_oleh: item.diminta_oleh?.nama || 'Dokter',
      status: item.status,
      catatan_dokter: item.catatan_dokter,
      hasil_pemeriksaan: item.hasil_pemeriksaan,
      nilai_rujukan: item.nilai_rujukan,
      created_at: item.created_at,
    }));
  }

  @Post()
  @RequirePermissions('resep.kirim') // Dokter can request lab tests
  @ApiOperation({ summary: 'Dokter meminta pemeriksaan penunjang lab atau radiologi' })
  async requestLab(
    @Body()
    body: {
      kunjungan_id: number;
      tipe: 'lab' | 'radiologi';
      jenis_pemeriksaan: string;
      catatan_dokter?: string;
    },
    @CurrentUser() user: any,
  ) {
    const item = this.labRepository.create({
      kunjungan_id: body.kunjungan_id,
      tipe: body.tipe || 'lab',
      jenis_pemeriksaan: body.jenis_pemeriksaan,
      diminta_oleh_user_id: user?.id,
      catatan_dokter: body.catatan_dokter,
      status: 'menunggu',
    });

    const saved = await this.labRepository.save(item);

    // Kirim notifikasi ke role Lab & Radiologi
    const notif = this.notifikasiRepository.create({
      role_kode: 'lab_radiologi',
      judul: `Permintaan ${body.tipe.toUpperCase()} Baru`,
      pesan: `Permintaan ${body.jenis_pemeriksaan} untuk kunjungan #${body.kunjungan_id}`,
      tipe: 'lab',
      tautan: '/lab',
      dibaca: false,
    });
    await this.notifikasiRepository.save(notif);

    return saved;
  }

  @Patch(':id/status')
  @RequirePermissions('lab.kelola')
  @ApiOperation({ summary: 'Analis memperbarui status pemeriksaan lab dan menginputkan hasil/laporan' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      status: string;
      hasil_pemeriksaan?: string;
      nilai_rujukan?: string;
    },
    @CurrentUser() user: any,
  ) {
    const item = await this.labRepository.findOne({
      where: { id },
      relations: { kunjungan: { pasien: true } },
    });
    if (!item) {
      throw new NotFoundException('Data pemeriksaan lab tidak ditemukan');
    }

    item.status = body.status;
    if (body.hasil_pemeriksaan) item.hasil_pemeriksaan = body.hasil_pemeriksaan;
    if (body.nilai_rujukan) item.nilai_rujukan = body.nilai_rujukan;
    if (user?.id) item.diproses_oleh_user_id = user.id;
    item.updated_at = new Date();

    const saved = await this.labRepository.save(item);

    // Jika hasil pemeriksaan sudah siap, beritahu Dokter
    if (body.status === 'hasil_siap' || body.status === 'selesai') {
      const notif = this.notifikasiRepository.create({
        role_kode: 'dokter',
        judul: `Hasil ${item.tipe.toUpperCase()} Siap: ${item.jenis_pemeriksaan}`,
        pesan: `Pemeriksaan untuk ${item.kunjungan?.pasien?.nama || 'Pasien'} telah selesai diproses.`,
        tipe: 'lab',
        tautan: `/lab`,
        dibaca: false,
      });
      await this.notifikasiRepository.save(notif);
    }

    return saved;
  }

  @Patch(':id/hasil')
  @RequirePermissions('lab.kelola')
  @ApiOperation({ summary: 'Analis menginputkan hasil dan referensi nilai rujukan' })
  async inputHasil(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      hasil_pemeriksaan: string;
      nilai_rujukan?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.updateStatus(id, { status: 'selesai', ...body }, user);
  }
}
