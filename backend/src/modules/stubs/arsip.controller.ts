import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ArsipDokumen } from '../../entities/arsip-dokumen.entity';
import { ArsipTracking } from '../../entities/arsip-tracking.entity';
import { Notifikasi } from '../../entities/notifikasi.entity';

@ApiTags('arsip')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('arsip')
export class ArsipStubController {
  constructor(
    @InjectRepository(ArsipDokumen)
    private arsipRepository: Repository<ArsipDokumen>,
    @InjectRepository(ArsipTracking)
    private trackingRepository: Repository<ArsipTracking>,
    @InjectRepository(Notifikasi)
    private notifikasiRepository: Repository<Notifikasi>,
  ) {}

  @Get('cari')
  @RequirePermissions('arsip.view')
  @ApiOperation({ summary: 'Cari lokasi berkas fisik rekam medis (Gedung, Lantai, Ruang, Area, Rak, Kolom, Baris, Box)' })
  @ApiQuery({ name: 'q', required: false })
  async cari(@Query('q') query?: string) {
    const q = (query || '').trim();
    if (!q) {
      return this.arsipRepository.find({
        order: { id: 'ASC' },
      });
    }

    return this.arsipRepository.find({
      where: [{ nama_pasien: ILike(`%${q}%`) }, { no_rm: ILike(`%${q}%`) }],
      order: { id: 'ASC' },
    });
  }

  @Get(':pasienId/tracking')
  @RequirePermissions('arsip.view')
  @ApiOperation({ summary: 'Lacak riwayat lifecycle dan pengiriman berkas rekam medis' })
  async tracking(@Param('pasienId', ParseIntPipe) pasienId: number) {
    const doc = await this.arsipRepository.findOne({ where: { pasien_id: pasienId } });
    if (!doc) {
      return [];
    }

    const logs = await this.trackingRepository.find({
      where: { arsip_id: doc.id },
      order: { waktu: 'ASC' },
    });

    if (logs.length === 0) {
      return [
        {
          label: 'Tersedia di Rak',
          keterangan: `Berkas tersimpan di ${doc.gedung}, ${doc.lantai}, ${doc.ruang}, ${doc.rak}, ${doc.box}`,
          waktu: new Date(doc.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          selesai: true,
          aktif: false,
        },
      ];
    }

    return logs.map((log, index) => {
      const isLast = index === logs.length - 1;
      return {
        label: log.status.toUpperCase().replace('_', ' '),
        keterangan: `${log.keterangan} (${log.from_location} ➔ ${log.to_location})`,
        waktu: new Date(log.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        selesai: !isLast,
        aktif: isLast,
      };
    });
  }

  @Post(':pasienId/minta-pengiriman')
  @RequirePermissions('arsip.minta_pengiriman')
  @ApiOperation({ summary: 'Meminta pengiriman dokumen antar lantai / antar poli' })
  async mintaPengiriman(
    @Param('pasienId', ParseIntPipe) pasienId: number,
    @Body() body: { tujuan_lantai: string },
    @CurrentUser() user: any,
  ) {
    const doc = await this.arsipRepository.findOne({ where: { pasien_id: pasienId } });
    if (!doc) {
      throw new NotFoundException(`Berkas rekam medis untuk pasien #${pasienId} tidak ditemukan`);
    }

    const fromLoc = `${doc.gedung} - ${doc.lantai} (${doc.rak} ${doc.box})`;
    const toLoc = body.tujuan_lantai || 'Poli Anak Lt.3';

    doc.status = 'dalam_pengiriman';
    doc.updated_at = new Date();
    await this.arsipRepository.save(doc);

    // Catat log tracking kurir
    const trackingLog = this.trackingRepository.create({
      arsip_id: doc.id,
      from_location: fromLoc,
      to_location: toLoc,
      requested_by_user_id: user?.id,
      status: 'dalam_pengiriman',
      keterangan: `Permintaan pengiriman berkas ${doc.nama_pasien} (${doc.no_rm}) sedang diproses kurir internal`,
      waktu: new Date(),
    });
    await this.trackingRepository.save(trackingLog);

    // Kirim notifikasi sistem
    const notif = this.notifikasiRepository.create({
      role_kode: 'perawat',
      judul: 'Berkas RM Dalam Pengiriman',
      pesan: `Berkas ${doc.nama_pasien} (${doc.no_rm}) sedang dikirim menuju ${toLoc}`,
      tipe: 'arsip',
      tautan: '/arsip',
      dibaca: false,
    });
    await this.notifikasiRepository.save(notif);

    return {
      success: true,
      message: `Permintaan pengiriman berkas pasien ${doc.nama_pasien} ke ${toLoc} berhasil diajukan.`,
      status: doc.status,
    };
  }

  @Patch(':id/status')
  @RequirePermissions('arsip.minta_pengiriman')
  @ApiOperation({ summary: 'Perbarui lifecycle dokumen (diambil, diterima, dipakai, dikembalikan, tersedia)' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; keterangan?: string },
    @CurrentUser() user: any,
  ) {
    const doc = await this.arsipRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException('Berkas rekam medis tidak ditemukan');
    }

    const prevStatus = doc.status;
    doc.status = body.status;
    doc.updated_at = new Date();
    await this.arsipRepository.save(doc);

    const log = this.trackingRepository.create({
      arsip_id: doc.id,
      from_location: `${doc.gedung} ${doc.lantai}`,
      to_location: body.status === 'tersedia' ? `${doc.rak} ${doc.box}` : 'Unit Pelayanan',
      requested_by_user_id: user?.id,
      status: body.status,
      keterangan: body.keterangan || `Status berkas beralih dari ${prevStatus} menjadi ${body.status}`,
      waktu: new Date(),
    });
    await this.trackingRepository.save(log);

    return { success: true, status: doc.status };
  }
}
