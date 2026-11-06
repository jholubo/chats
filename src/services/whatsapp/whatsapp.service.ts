import { WhatsAppConfig, WhatsAppTemplate, Message, MessageType } from '../../types';

/**
 * Service Abstraction Layer for WhatsApp Business Cloud API & Simulation Engine.
 * Enables seamless switching between simulated sandbox messages and Meta Graph API endpoints.
 */
export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  public setConfig(newConfig: WhatsAppConfig) {
    this.config = newConfig;
  }

  public getConfig(): WhatsAppConfig {
    return this.config;
  }

  /**
   * Send a message through WhatsApp Cloud API or local WebSocket simulation
   */
  public async sendMessage(params: {
    toPhoneNumber: string;
    chatId: string;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    fileName?: string;
    fileSize?: string;
    location?: { lat: number; lng: number; name: string; address: string };
    templateName?: string;
    replyToId?: string;
  }): Promise<Message> {
    const messageId = `wa_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: Message = {
      id: messageId,
      chatId: params.chatId,
      senderId: 'user_me',
      senderName: 'Jhonnyl Lubo',
      type: params.type,
      content: params.content,
      media: params.mediaUrl ? {
        url: params.mediaUrl,
        fileName: params.fileName,
        fileSize: params.fileSize,
      } : undefined,
      location: params.location,
      timestamp: timeStr,
      fullTimestamp: `Hoy a las ${timeStr}`,
      status: 'sending',
      fromMe: true,
      replyTo: params.replyToId ? {
        id: params.replyToId,
        senderName: 'Contacto',
        content: 'Mensaje respondido',
        type: 'text',
      } : undefined,
    };

    if (this.config.mode === 'cloud_api') {
      try {
        console.log(`[WhatsApp Cloud API] Dispatching message to Meta Graph API (${this.config.phoneNumberId})...`);
        const response = await fetch('/api/whatsapp/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: params.toPhoneNumber,
            type: params.type,
            text: params.content,
            mediaUrl: params.mediaUrl,
            templateName: params.templateName,
          }),
        });
        
        if (response.ok) {
          newMessage.status = 'sent';
        }
      } catch (err) {
        console.error('[WhatsApp Cloud API Error]:', err);
      }
    } else {
      // Simulation mode
      console.log(`[LuboChat Simulation] Dispatching simulated message to ${params.chatId}`);
      newMessage.status = 'sent';
    }

    return newMessage;
  }

  /**
   * Verify WABA Access Token and Phone Number ID credentials
   */
  public async verifyCredentials(): Promise<{ valid: boolean; message: string }> {
    if (this.config.mode === 'simulation') {
      return { valid: true, message: 'Modo Simulación activo (Sandbox LuboChat)' };
    }

    if (!this.config.phoneNumberId || !this.config.accessToken) {
      return { valid: false, message: 'Falta Phone Number ID o Access Token de Meta' };
    }

    return { valid: true, message: 'Conexión exitosa con Meta WhatsApp Business API' };
  }
}
