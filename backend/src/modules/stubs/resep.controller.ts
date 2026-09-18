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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

// In-memory stub cache for Orang B (Resep)
const MOCK_RESEP_THREAD = [
  {
    id: 1,
    kunjungan_id: 103,
    dari_user: 'dr. Angga, Sp.A',
    ke_user: 'Apt. Ratna Wijaya',
    isi_pesan: 'Tolong siapkan resep untuk An. Bilqis ya.',
    resep_item: [
      {
        nama_obat: 'Parasetamol drops 100mg/mL',
        aturan_pakai: 'Tiap 6 jam bila demam',
        jumlah: '1 botol',
      },
      {
        nama_obat: 'NaCl 0,9% nasal drops',
        aturan_pakai: '2 tetes/lubang hidung',
        jumlah: '1 botol',
      },
      {
        nama_obat: 'Zinc sirup 20mg/5mL',
        aturan_pakai: '1x sehari, 10 hari',
        jumlah: '1 botol',
      },
    ],
    status: 'terkirim',
    waktu: '2026-09-18T09:35:00Z',
  },
  {
    id: 2,
    kunjungan_id: 103,
    dari_user: 'Apt. Ratna Wijaya',
    ke_user: 'dr. Angga, Sp.A',
    isi_pesan: 'Diterima, sedang disiapkan di racikan 2. Estimasi 10 menit.',
    status: 'disiapkan',
    waktu: '2026-09-18T09:37:00Z',
  },
  {
    id: 3,
    kunjungan_id: 103,
    dari_user: 'Apt. Ratna Wijaya',
    ke_user: 'dr. Angga, Sp.A',
    isi_pesan: 'Resep sudah siap diambil di loket apotek.',
    status: 'siap_diambil',
    waktu: '2026-09-18T09:47:00Z',
  },
];

let resepCache = [...MOCK_RESEP_THREAD];

@ApiTags('resep (stub)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('resep')
export class ResepStubController {
  @Get()
  @RequirePermissions('resep.kirim')
  @ApiOperation({ summary: 'Stub: Riwayat pesan resep untuk kunjungan tertentu' })
  @ApiQuery({ name: 'kunjungan_id', example: 103 })
  async getResep(@Query('kunjungan_id', ParseIntPipe) kunjunganId: number) {
    return resepCache.filter((r) => r.kunjungan_id === kunjunganId);
  }

  @Post()
  @RequirePermissions('resep.kirim')
  @ApiOperation({ summary: 'Stub: Dokter mengirim resep baru ke apoteker' })
  async kirimResep(@Body() payload: any) {
    const item = {
      ...payload,
      id: resepCache.length + 1,
      waktu: new Date().toISOString(),
      status: payload.status || 'terkirim',
    };
    resepCache.push(item);
    return item;
  }

  @Patch(':id/status')
  @RequirePermissions('resep.proses')
  @ApiOperation({ summary: 'Stub: Apoteker memperbarui status penyiapan resep' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    const item = resepCache.find((r) => r.id === id);
    if (!item) {
      throw new NotFoundException('Pesan resep tidak ditemukan');
    }
    item.status = body.status;
    return item;
  }
}
