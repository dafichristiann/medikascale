import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KlinisService } from './klinis.service';
import { CreatePemeriksaanDto } from './dto/create-pemeriksaan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequireAnyPermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('klinis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('klinis')
export class KlinisController {
  constructor(private readonly klinisService: KlinisService) {}

  @Post('pemeriksaan')
  @RequireAnyPermissions('resep.kirim', 'antrian.ubah_status')
  @ApiOperation({ summary: 'Simpan pemeriksaan dokter 360, e-resep, dan penunjang' })
  async createPemeriksaan(
    @Body() dto: CreatePemeriksaanDto,
    @CurrentUser() user: any,
  ) {
    return this.klinisService.createPemeriksaan(dto, user);
  }

  @Get('kunjungan/:id/detail')
  @RequireAnyPermissions('antrian.view', 'pasien.view')
  @ApiOperation({ summary: 'Dapatkan detail 360 rekam medis kunjungan pasien' })
  async getDetailKunjungan(@Param('id', ParseIntPipe) id: number) {
    return this.klinisService.getDetailKunjungan(id);
  }
}
