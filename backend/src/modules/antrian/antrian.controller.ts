import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AntrianService } from './antrian.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdatePrioritasDto } from './dto/update-prioritas.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('antrian')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('antrian')
export class AntrianController {
  constructor(private antrianService: AntrianService) {}

  @Get()
  @RequirePermissions('antrian.view')
  @ApiOperation({ summary: 'Mendapatkan daftar antrian berdasarkan tanggal' })
  @ApiQuery({ name: 'tanggal', required: false, example: '2026-09-18' })
  async getAntrian(@Query('tanggal') tanggal?: string) {
    return this.antrianService.findByTanggal(tanggal);
  }

  @Patch(':id/status')
  @RequirePermissions('antrian.ubah_status')
  @ApiOperation({ summary: 'Memperbarui status antrian pasien' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.antrianService.updateStatus(id, dto.status, user?.id);
  }

  @Patch(':id/prioritas')
  @RequirePermissions('antrian.prioritaskan')
  @ApiOperation({ summary: 'Menandai antrian sebagai prioritas' })
  async updatePrioritas(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePrioritasDto,
  ) {
    return this.antrianService.updatePrioritas(id, dto.prioritas);
  }
}
