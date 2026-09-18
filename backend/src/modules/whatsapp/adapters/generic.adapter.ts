import { Injectable, Logger } from '@nestjs/common';
import { IWhatsAppProviderAdapter, InboundMessage, OutboundMessage } from './wa-provider.interface';

@Injectable()
export class GenericWhatsAppAdapter implements IWhatsAppProviderAdapter {
  private readonly logger = new Logger(GenericWhatsAppAdapter.name);

  parseInbound(body: any): InboundMessage {
    const from = body?.from || body?.sender || body?.phone || '';
    const message = body?.message || body?.text || body?.body || '';
    return {
      from: String(from).trim(),
      message: String(message).trim(),
      rawPayload: body,
    };
  }

  async sendOutbound(message: OutboundMessage): Promise<boolean> {
    // In generic/simulation mode, log to console / memory
    this.logger.log(`[Generic WA Outbound] To: ${message.to} | Message: ${message.message.replace(/\n/g, ' ')}`);
    return true;
  }
}
