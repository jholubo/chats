import { Message } from '../../types';

export interface WebhookStatusPayload {
  messageId: string;
  status: 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipientId: string;
}

export class WhatsAppWebhookService {
  /**
   * Parse incoming webhook payload from Meta Cloud API
   */
  public static parseIncomingWebhook(rawPayload: any): {
    messages: Partial<Message>[];
    statuses: WebhookStatusPayload[];
  } {
    const messages: Partial<Message>[] = [];
    const statuses: WebhookStatusPayload[] = [];

    if (!rawPayload?.entry) return { messages, statuses };

    for (const entry of rawPayload.entry) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value) continue;

        // Parse incoming messages
        if (value.messages) {
          for (const msg of value.messages) {
            messages.push({
              id: msg.id,
              senderId: msg.from,
              senderName: value.contacts?.[0]?.profile?.name || msg.from,
              type: msg.type || 'text',
              content: msg.text?.body || msg.caption || '',
              timestamp: new Date(parseInt(msg.timestamp) * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              status: 'delivered',
              fromMe: false,
            });
          }
        }

        // Parse message status updates (read, delivered, failed)
        if (value.statuses) {
          for (const st of value.statuses) {
            statuses.push({
              messageId: st.id,
              status: st.status,
              timestamp: st.timestamp,
              recipientId: st.recipient_id,
            });
          }
        }
      }
    }

    return { messages, statuses };
  }
}
