import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

// In-memory stub data for Orang B (Arsip)
const MOCK_ARSIP = [
  {
    pasien_id: 3,
    no_rm: 'RM-2024-018472',
    nama_pasien: 'Bilqis Nur Aisyah',
    lantai: 'Lantai 2',
    ruang: 'Ruang Arsip B',
    rak: 'Rak 5',
    baris: 'Baris 3',
    kotak: 'Kotak 12',
    status: 'tersedia',
  },
  {
    pasien_id: 1,
    no_rm: 'RM-2023-004120',
    nama_pasien: 'Ahmad Fauzi',
    lantai: 'Lantai 2',
    ruang: 'Ruang Arsip A',
    rak: 'Rak 2',
    baris: 'Baris 1',
    kotak: 'Kotak 04',
    status: 'tersedia',
  },
];

const MOCK_TRACKING = [
  { label: 'Diminta', keterangan: 'Perawat Lt.1 meminta berkas RM', waktu: '09:02', selesai: true, aktif: false },
  { label: 'Dikemas & diberi barcode', keterangan: 'Petugas arsip Lt.2 memindai keluar berkas', waktu: '09:06', selesai: true, aktif: false },
  { label: 'Dalam perjalanan', keterangan: 'Kurir: Pak Dedi, Lt.2 → Lt.3, dipindai di lift', waktu: '09:09', selesai: false, aktif: true },
  { label: 'Diterima & diverifikasi', keterangan: 'Menunggu pindai masuk di Poli Anak Lt.3', selesai: false, aktif: false },
];

@ApiTags('arsip (stub)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('arsip')
export class ArsipStubController {
  @Get('cari')
  @RequirePermissions('arsip.view')
  @ApiOperation({ summary: 'Stub: Cari lokasi berkas rekam medis' })
  @ApiQuery({ name: 'q', required: false })
  async cari(@Query('q') query?: string) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return MOCK_ARSIP;
    return MOCK_ARSIP.filter(
      (a) =>
        a.nama_pasien.toLowerCase().includes(q) ||
        a.no_rm.toLowerCase().includes(q),
    );
  }

  @Get(':pasienId/tracking')
  @RequirePermissions('arsip.view')
  @ApiOperation({ summary: 'Stub: Lacak pengiriman berkas rekam medis antar lantai' })
  async tracking(@Param('pasienId', ParseIntPipe) _pasienId: number) {
    return MOCK_TRACKING;
  }

  @Post(':pasienId/minta-pengiriman')
  @RequirePermissions('arsip.minta_pengiriman')
  @ApiOperation({ summary: 'Stub: Minta pengiriman dokumen antar lantai' })
  async mintaPengiriman(
    @Param('pasienId', ParseIntPipe) pasienId: number,
    @Body() body: { tujuan_lantai: string },
  ) {
    return {
      success: true,
      message: `Permintaan pengiriman berkas pasien #${pasienId} ke ${body.tujuan_lantai} berhasil dikirim ke kurir.`,
    };
  }
}
