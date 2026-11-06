import { Message, Conversation, Contact } from '../../types';

export class SimulationEngine {
  private static SIMULATED_REPLIES: Record<string, string[]> = {
    c_01: [
      '¡Entendido! Lo revisaré con el equipo de infraestructura.',
      'Excelente actualización de LuboChat. Las animaciones y el diseño de WhatsApp Web quedaron idénticos.',
      'Te acabo de enviar el informe por correo. Quedo al pendiente.',
      '¿Cuándo realizaremos las pruebas de carga para los WebSockets?',
    ],
    c_02: [
      '¡Perfecto! Ya configuramos los 12 agentes para la recepción de leads.',
      'Las notas de voz se escuchan nítidas en el reproductor.',
      'Nos encantó la interfaz oscura y clara en modo WhatsApp.',
    ],
    c_03: [
      'Aprobada la campaña de WhatsApp Marketing para esta semana. 🔥',
      'Te enviaré las métricas actualizadas de conversión.',
    ],
    c_04: [
      'Gracias por la información. Nos vemos en la cita.',
      'Te acabo de compartir la ubicación exacta por WhatsApp.',
    ],
  };

  /**
   * Schedule a simulated response from a contact with realistic typing delays
   */
  public static triggerSimulatedReply(
    conversation: Conversation,
    userMessageContent: string,
    onTypingChange: (chatId: string, isTyping: boolean) => void,
    onReplyGenerated: (message: Message) => void
  ) {
    const contactId = conversation.contact.id;
    const replies = this.SIMULATED_REPLIES[contactId] || [
      '¡Mensaje recibido en LuboChat! Todo funcionando al 100%.',
      'Gracias por escribir. Respuesta automática simulada exitosa.',
    ];

    // Pick reply
    const selectedText = replies[Math.floor(Math.random() * replies.length)];

    // 1. Wait 1s, set typing state to true
    setTimeout(() => {
      onTypingChange(conversation.id, true);

      // 2. Wait 2.5s while typing, then send message and set typing to false
      setTimeout(() => {
        onTypingChange(conversation.id, false);

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const replyMsg: Message = {
          id: `sim_reply_${Date.now()}`,
          chatId: conversation.id,
          senderId: conversation.contact.id,
          senderName: conversation.contact.name,
          senderAvatar: conversation.contact.avatar,
          type: 'text',
          content: selectedText,
          timestamp: timeStr,
          fullTimestamp: `Hoy a las ${timeStr}`,
          status: 'read',
          fromMe: false,
        };

        onReplyGenerated(replyMsg);
      }, 2500);
    }, 1000);
  }
}
