import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotifikasiService } from './notifikasi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifikasi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifikasi')
export class NotifikasiController {
  constructor(private readonly notifikasiService: NotifikasiService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar notifikasi untuk user / role yang sedang login' })
  async getNotifikasi(@CurrentUser() user: any) {
    const roleKode = typeof user?.role === 'string' ? user.role : user?.role?.kode;
    return this.notifikasiService.getNotifikasiForUser(user?.id, roleKode);
  }

  @Patch(':id/baca')
  @ApiOperation({ summary: 'Menandai 1 notifikasi telah dibaca' })
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notifikasiService.markAsRead(id);
  }

  @Patch('baca-semua')
  @ApiOperation({ summary: 'Menandai semua notifikasi telah dibaca' })
  async markAllAsRead(@CurrentUser() user: any) {
    const roleKode = typeof user?.role === 'string' ? user.role : user?.role?.kode;
    return this.notifikasiService.markAllAsRead(user?.id, roleKode);
  }
}
