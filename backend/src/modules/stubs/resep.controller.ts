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
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  RequirePermissions,
  RequireAnyPermissions,
} from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResepObat } from '../../entities/resep-obat.entity';
import { Notifikasi } from '../../entities/notifikasi.entity';
import { Kunjungan } from '../../entities/kunjungan.entity';
import { AntrianLog } from '../../entities/antrian-log.entity';

@ApiTags('resep')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('resep')
export class ResepStubController {
  constructor(
    @InjectRepository(ResepObat)
    private resepRepository: Repository<ResepObat>,
    @InjectRepository(Notifikasi)
    private notifikasiRepository: Repository<Notifikasi>,
    @InjectRepository(Kunjungan)
    private kunjunganRepository: Repository<Kunjungan>,
    @InjectRepository(AntrianLog)
    private antrianLogRepository: Repository<AntrianLog>,
  ) {}

  @Get()
  @RequireAnyPermissions('resep.kirim', 'resep.proses')
  @ApiOperation({ summary: 'Riwayat pesan resep untuk kunjungan tertentu atau seluruhnya' })
  @ApiQuery({ name: 'kunjungan_id', required: false, example: 103 })
  async getResep(@Query('kunjungan_id') kunjunganId?: string) {
    if (kunjunganId) {
      const kid = parseInt(kunjunganId, 10);
      return this.resepRepository.find({
        where: { kunjungan_id: kid },
        order: { waktu: 'ASC' },
      });
    }
    return this.resepRepository.find({
      order: { waktu: 'DESC' },
      take: 50,
    });
  }

  @Post()
  @RequirePermissions('resep.kirim')
  @ApiOperation({ summary: 'Dokter mengirim resep baru ke apoteker' })
  async kirimResep(@Body() payload: any, @CurrentUser() user: any) {
    const item = this.resepRepository.create({
      kunjungan_id: payload.kunjungan_id,
      dokter_user_id: user?.id,
      dari_user: user?.nama || payload.dari_user || 'Dokter',
      ke_user: payload.ke_user || 'Apoteker',
      isi_pesan: payload.isi_pesan || 'Resep baru dari dokter',
      resep_item: payload.resep_item || [],
      status: payload.status || 'menunggu',
      waktu: new Date(),
    });

    const saved = await this.resepRepository.save(item);

    // Otomatis buat notifikasi untuk Apoteker
    const notif = this.notifikasiRepository.create({
      role_kode: 'apoteker',
      judul: 'Resep Masuk Baru',
      pesan: `${item.dari_user} mengirim e-resep untuk kunjungan #${item.kunjungan_id}`,
      tipe: 'resep',
      tautan: `/resep?kunjungan_id=${item.kunjungan_id}`,
      dibaca: false,
    });
    await this.notifikasiRepository.save(notif);

    // Jika antrian pasien masih 'kuning', otomatis ubah ke 'merah' (dapat resep)
    const kunjungan = await this.kunjunganRepository.findOne({
      where: { id: payload.kunjungan_id },
    });
    if (kunjungan && kunjungan.status_antrian === 'kuning') {
      kunjungan.status_antrian = 'merah';
      kunjungan.updated_at = new Date();
      await this.kunjunganRepository.save(kunjungan);

      const log = this.antrianLogRepository.create({
        kunjungan_id: kunjungan.id,
        status_dari: 'kuning',
        status_ke: 'merah',
        diubah_oleh_user_id: user?.id ?? null,
        waktu: new Date(),
      });
      await this.antrianLogRepository.save(log);
    }

    return saved;
  }

  @Patch(':id/status')
  @RequirePermissions('resep.proses')
  @ApiOperation({ summary: 'Apoteker memperbarui status penyiapan resep (menunggu -> diproses -> siap_diambil -> diserahkan -> selesai)' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
    @CurrentUser() user: any,
  ) {
    const item = await this.resepRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Pesan resep tidak ditemukan');
    }

    item.status = body.status;
    if (user?.id) item.apoteker_user_id = user.id;
    item.updated_at = new Date();
    const saved = await this.resepRepository.save(item);

    // Kirim notifikasi jika obat siap diambil atau diserahkan
    if (body.status === 'siap_diambil' || body.status === 'diserahkan') {
      const notif = this.notifikasiRepository.create({
        role_kode: 'dokter',
        judul: `Obat Siap Diambil (Kunjungan #${item.kunjungan_id})`,
        pesan: `Resep obat telah selesai disiapkan oleh farmasi dan ${body.status === 'siap_diambil' ? 'siap diambil di loket apotek' : 'telah diserahkan ke pasien'}.`,
        tipe: 'resep',
        tautan: `/resep?kunjungan_id=${item.kunjungan_id}`,
        dibaca: false,
      });
      await this.notifikasiRepository.save(notif);
    }

    // Jika obat diserahkan ke pasien, otomatis majukan status antrian kunjungan ke 'selesai'
    if (body.status === 'diserahkan') {
      const kunjungan = await this.kunjunganRepository.findOne({
        where: { id: item.kunjungan_id },
      });
      if (kunjungan && kunjungan.status_antrian === 'merah') {
        kunjungan.status_antrian = 'selesai';
        kunjungan.updated_at = new Date();
        await this.kunjunganRepository.save(kunjungan);

        const log = this.antrianLogRepository.create({
          kunjungan_id: kunjungan.id,
          status_dari: 'merah',
          status_ke: 'selesai',
          diubah_oleh_user_id: user?.id ?? null,
          waktu: new Date(),
        });
        await this.antrianLogRepository.save(log);
      }
    }

    return saved;
  }
}
