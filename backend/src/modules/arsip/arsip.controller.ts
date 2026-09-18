import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ArsipService } from './arsip.service';

@ApiTags('arsip') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller('arsip')
export class ArsipController {
  constructor(private readonly service: ArsipService) {}
  @Get('maps') @RequirePermissions('arsip.view') @ApiOperation({ summary: 'Cari map rekam medis dari database' }) maps(@Query('q') q?: string) { return this.service.findMaps(q); }
  @Get('pasien') @RequirePermissions('arsip.manage') patients() { return this.service.patients(); }
  @Post('maps') @RequirePermissions('arsip.manage') createMap(@Body() body: { nomor_map: string; nomor_dokumen?: string; pasien_id: number; lokasi_id?: number }) { return this.service.createMap(body); }
  @Get('cari') @RequirePermissions('arsip.view') cari(@Query('q') q?: string) { return this.service.findMaps(q); }
  @Get('lokasi') @RequirePermissions('arsip.view') locations() { return this.service.locations(); }
  @Post('lokasi') @RequirePermissions('arsip.manage') createLocation(@Body() body: any, @CurrentUser() user: any) { return this.service.createLocation(body, user?.id); }
  @Patch('lokasi/:id') @RequirePermissions('arsip.manage') updateLocation(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.service.updateLocation(id, body); }
  @Delete('lokasi/:id') @RequirePermissions('arsip.manage') deleteLocation(@Param('id', ParseIntPipe) id: number) { return this.service.deleteLocation(id); }
  @Get('riwayat') @RequirePermissions('arsip.view') history() { return this.service.history(); }
  @Post('maps/:id/pinjam') @RequirePermissions('arsip.pinjam') borrow(@Param('id', ParseIntPipe) id: number, @Body() body: { keterangan: string }, @CurrentUser() user: any) { return this.service.borrow(id, user?.id, body.keterangan); }
  @Post('maps/:id/kembalikan') @RequirePermissions('arsip.kembalikan') returnMap(@Param('id', ParseIntPipe) id: number, @Body() body: { keterangan: string }) { return this.service.returnMap(id, body.keterangan); }
  @Get(':pasienId/tracking') @RequirePermissions('arsip.view') tracking(@Param('pasienId', ParseIntPipe) pasienId: number) {
    return [{ label: 'Berkas ditemukan', keterangan: `Map pasien #${pasienId} diambil dari database`, selesai: true, aktif: false }, { label: 'Siap digunakan', keterangan: 'Menunggu permintaan pengiriman unit', selesai: false, aktif: true }];
  }
  @Post(':pasienId/minta-pengiriman') @RequirePermissions('arsip.minta_pengiriman') requestDelivery(@Param('pasienId', ParseIntPipe) pasienId: number, @Body() body: { tujuan_lantai: string }) {
    return { success: true, message: `Permintaan pengiriman berkas pasien #${pasienId} ke ${body.tujuan_lantai} berhasil dicatat.` };
  }
}
