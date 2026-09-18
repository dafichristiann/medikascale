import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IWhatsAppProviderAdapter, InboundMessage, OutboundMessage } from './wa-provider.interface';

@Injectable()
export class FonnteWhatsAppAdapter implements IWhatsAppProviderAdapter {
  private readonly logger = new Logger(FonnteWhatsAppAdapter.name);

  constructor(private configService: ConfigService) {}

  parseInbound(body: any): InboundMessage {
    // Fonnte webhook payload format: { sender: '628...', message: '...', ... }
    const from = body?.sender || body?.from || '';
    const message = body?.message || '';
    return {
      from: String(from).trim(),
      message: String(message).trim(),
      rawPayload: body,
    };
  }

  async sendOutbound(message: OutboundMessage): Promise<boolean> {
    const token = this.configService.get<string>('FONNTE_TOKEN');
    if (!token) {
      this.logger.warn('FONNTE_TOKEN is not configured. Falling back to log.');
      this.logger.log(`[Fonnte Mock Send] To: ${message.to} | Message: ${message.message}`);
      return true;
    }

    try {
      const res = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: message.to,
          message: message.message,
        }),
      });
      return res.ok;
    } catch (err) {
      this.logger.error(`Error sending message via Fonnte: ${err.message}`);
      return false;
    }
  }
}
