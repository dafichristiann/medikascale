import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

// In-memory stub data for Orang B (Lab & Radiologi)
const MOCK_LAB = [
  {
    id: 1,
    pasien: { no_rm: 'RM-2024-018472', nama: 'Bilqis Nur Aisyah' },
    pemeriksaan: 'Darah rutin',
    diminta_oleh: 'dr. Angga, Sp.A',
    status: 'diproses',
  },
  {
    id: 2,
    pasien: { no_rm: 'RM-2023-004120', nama: 'Ahmad Fauzi' },
    pemeriksaan: 'Rontgen toraks',
    diminta_oleh: 'dr. Angga, Sp.A',
    status: 'menunggu',
  },
  {
    id: 3,
    pasien: { no_rm: 'RM-2022-009981', nama: 'Siti Aminah' },
    pemeriksaan: 'Urinalisis',
    diminta_oleh: 'dr. Angga, Sp.A',
    status: 'hasil_siap',
  },
];

let labCache = [...MOCK_LAB];

@ApiTags('lab (stub)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('lab')
export class LabStubController {
  @Get()
  @RequirePermissions('lab.kelola')
  @ApiOperation({ summary: 'Stub: Daftar permintaan pemeriksaan lab & radiologi' })
  async getLab() {
    return labCache;
  }

  @Patch(':id/status')
  @RequirePermissions('lab.kelola')
  @ApiOperation({ summary: 'Stub: Memperbarui status pemeriksaan lab' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    const item = labCache.find((l) => l.id === id);
    if (!item) {
      throw new NotFoundException('Data pemeriksaan lab tidak ditemukan');
    }
    item.status = body.status;
    return item;
  }
}
