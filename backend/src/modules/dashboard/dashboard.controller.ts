import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Mendapatkan ringkasan statistik antrian & layanan hari ini' })
  @ApiQuery({ name: 'tanggal', required: false, example: '2026-09-18' })
  async getSummary(@Query('tanggal') tanggal?: string) {
    return this.dashboardService.getSummary(tanggal);
  }
}
