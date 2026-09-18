import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { WaWebhookDto } from './dto/wa-webhook.dto';

@ApiTags('whatsapp')
@Controller('wa')
export class WhatsAppController {
  constructor(private waService: WhatsAppService) {}

  @Post('webhook')
  @ApiOperation({
    summary: 'Webhook penerima pesan WhatsApp masuk (Provider-agnostic / generic)',
    description:
      'Menerima pesan masuk dari provider WhatsApp (misal Fonnte/Generic) dengan payload { from, message }.',
  })
  @ApiResponse({ status: 200, description: 'Pesan berhasil diproses oleh state machine' })
  async webhook(@Body() dto: WaWebhookDto) {
    return this.waService.processIncomingMessage(dto);
  }

  @Post('simulate')
  @ApiOperation({
    summary: 'Simulasi interaktif chat WhatsApp via Swagger/Postman',
    description:
      'Endpoint pengujian interaktif alur chatbot pendaftaran dan cek antrian tanpa perlu device WA fisik.',
  })
  async simulate(@Body() dto: WaWebhookDto) {
    return this.waService.processIncomingMessage(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Melihat riwayat log pesan WhatsApp berdasarkan nomor telepon' })
  @ApiQuery({ name: 'phone', example: '081234567890' })
  async getHistory(@Query('phone') phone: string) {
    return this.waService.getSessionHistory(phone);
  }
}
