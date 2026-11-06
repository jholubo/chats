import { Message, MessageType, WhatsAppTemplate } from '../../types';

export class WhatsAppMessageService {
  /**
   * Format template payload according to Meta Graph API spec
   */
  public static formatTemplatePayload(
    template: WhatsAppTemplate,
    recipientPhone: string,
    parameters: string[]
  ) {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'template',
      template: {
        name: template.name,
        language: {
          code: template.language,
        },
        components: [
          {
            type: 'body',
            parameters: parameters.map((param) => ({
              type: 'text',
              text: param,
            })),
          },
        ],
      },
    };
  }

  /**
   * Generate realistic WhatsApp Web status ticks (sending -> sent -> delivered -> read)
   */
  public static getStatusIconInfo(status: Message['status']) {
    switch (status) {
      case 'sending':
        return { label: 'Enviando...', color: 'text-gray-400' };
      case 'sent':
        return { label: 'Enviado', color: 'text-gray-400' };
      case 'delivered':
        return { label: 'Entregado', color: 'text-gray-400' };
      case 'read':
        return { label: 'Leído', color: 'text-sky-500' };
      default:
        return { label: '', color: 'text-gray-400' };
    }
  }
}
