export interface InboundMessage {
  from: string;
  message: string;
  rawPayload?: any;
}

export interface OutboundMessage {
  to: string;
  message: string;
}

export interface IWhatsAppProviderAdapter {
  parseInbound(body: any): InboundMessage;
  sendOutbound(message: OutboundMessage): Promise<boolean>;
}
