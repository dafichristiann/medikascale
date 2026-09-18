import { Controller, Post, Get, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AntropometriService } from './antropometri.service';
import { CreateAntropometriDto } from './dto/create-antropometri.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  RequirePermissions,
  RequireAnyPermissions,
} from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('antropometri')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('antropometri')
export class AntropometriController {
  constructor(private antropometriService: AntropometriService) {}

  @Post()
  @RequirePermissions('antropometri.input')
  @ApiOperation({ summary: 'Simpan hasil pengukuran antropometri dan hitung z-score WHO' })
  async create(
    @Body() dto: CreateAntropometriDto,
    @CurrentUser() user: any,
  ) {
    return this.antropometriService.create(dto, user?.id);
  }

  @Get('kunjungan/:kunjunganId')
  @RequireAnyPermissions('antropometri.input', 'antrian.view')
  @ApiOperation({ summary: 'Melihat riwayat pengukuran antropometri untuk kunjungan pasien tertentu' })
  @ApiParam({ name: 'kunjunganId', example: 103 })
  async findByKunjungan(@Param('kunjunganId', ParseIntPipe) kunjunganId: number) {
    return this.antropometriService.findByKunjunganId(kunjunganId);
  }
}
