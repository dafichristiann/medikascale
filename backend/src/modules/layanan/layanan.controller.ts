import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LayananService } from './layanan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('layanan')
@Controller('layanan')
export class LayananController {
  constructor(private layananService: LayananService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan katalog layanan yang aktif' })
  async findAll() {
    return this.layananService.findAll();
  }
}
