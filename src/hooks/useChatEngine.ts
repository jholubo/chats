import { useState, useEffect, useRef } from 'react';
import {
  Conversation,
  Message,
  UserProfile,
  WhatsAppConfig,
  WhatsAppTemplate,
  UserStatusStory,
  MessageType,
  Contact,
  Seller,
  DistributionConfig,
  ContactNote,
  ConversationStatus,
  ActiveViewer,
  ActiveTyping,
  ChatFilterTab,
  CrmStage,
  QuickResponse,
  FollowUpReminder,
  ActivityEvent,
  ActivityEventType,
  NotificationSettings,
  TransferPayload,
  CloseChatPayload,
} from '../types';
import {
  CURRENT_USER,
  INITIAL_CONFIG,
  INITIAL_CONVERSATIONS,
  INITIAL_STORIES,
  INITIAL_TEMPLATES,
  MOCK_MESSAGES_BY_CHAT,
  INITIAL_SELLERS,
  INITIAL_DISTRIBUTION,
  INITIAL_CONTACTS,
  INITIAL_QUICK_RESPONSES,
} from '../data/mockData';
import { WhatsAppService } from '../services/whatsapp/whatsapp.service';
import { SimulationEngine } from '../services/simulation/simulationEngine';

export function useChatEngine() {
  // Enterprise Sellers & Role Engine
  const [sellers, setSellers] = useState<Seller[]>(INITIAL_SELLERS);
  const [activeSellerId, setActiveSellerId] = useState<string>('seller_admin');
  const [distributionConfig, setDistributionConfig] = useState<DistributionConfig>(INITIAL_DISTRIBUTION);

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

  // Quick Responses
  const [quickResponses, setQuickResponses] = useState<QuickResponse[]>(INITIAL_QUICK_RESPONSES);

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    browserAlertsEnabled: true,
    slaMinutesAlert: 5,
    alertOnUnassigned: true,
  });

  const playNotificationSound = () => {
    if (!notificationSettings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.1);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  // WhatsApp Core state
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_01');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(MOCK_MESSAGES_BY_CHAT);

  const [userProfile, setUserProfile] = useState<UserProfile>(CURRENT_USER);
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(INITIAL_CONFIG);
  const [templates] = useState<WhatsAppTemplate[]>(INITIAL_TEMPLATES);
  const [stories] = useState<UserStatusStory[]>(INITIAL_STORIES);

  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

  // Filter tab for chat list: 'all' | 'mine' | 'new' | 'unassigned' | 'closed'
  const [activeFilter, setActiveFilter] = useState<ChatFilterTab>('all');

  // Drawers & Modals
  const [drawerProfileOpen, setDrawerProfileOpen] = useState(false);
  const [drawerSettingsOpen, setDrawerSettingsOpen] = useState(false);
  const [drawerStatusOpen, setDrawerStatusOpen] = useState(false);
  const [drawerNewChatOpen, setDrawerNewChatOpen] = useState(false);
  const [drawerInfoOpen, setDrawerInfoOpen] = useState(false);
  const [modalDistributionOpen, setModalDistributionOpen] = useState(false);
  const [drawerContactsOpen, setDrawerContactsOpen] = useState(false);

  // WebSocket Connection Ref
  const wsRef = useRef<WebSocket | null>(null);

  // WhatsApp Service Ref
  const whatsappService = useRef<WhatsAppService>(new WhatsAppService(waConfig));

  const activeSeller = sellers.find((s) => s.id === activeSellerId) || sellers[0];

  // Sync WebSocket Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[LuboChat Frontend] WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          if (type === 'VIEWING') {
            const { chatId, activeViewers } = data;
            setConversations((prev) =>
              prev.map((c) => (c.id === chatId ? { ...c, activeViewers } : c))
            );
          } else if (type === 'TYPING') {
            const { chatId, activeTyping } = data;
            setConversations((prev) =>
              prev.map((c) => (c.id === chatId ? { ...c, activeTyping } : c))
            );
          } else if (type === 'LOCK_CHAT') {
            const { chatId, sellerId, sellerName, lockedAt } = data;
            setConversations((prev) =>
              prev.map((c) =>
                c.id === chatId
                  ? { ...c, lockedBySellerId: sellerId, lockedBySellerName: sellerName, lockedAt }
                  : c
              )
            );
          } else if (type === 'UNLOCK_CHAT') {
            const { chatId } = data;
            setConversations((prev) =>
              prev.map((c) =>
                c.id === chatId
                  ? { ...c, lockedBySellerId: undefined, lockedBySellerName: undefined, lockedAt: undefined }
                  : c
              )
            );
          } else if (type === 'TAKEOVER') {
            const { chatId, adminSellerId, adminSellerName } = data;
            setConversations((prev) =>
              prev.map((c) =>
                c.id === chatId
                  ? {
                      ...c,
                      assignedSellerId: adminSellerId,
                      assignedSellerName: adminSellerName,
                      status: 'IN_PROGRESS',
                      lockedBySellerId: adminSellerId,
                      lockedBySellerName: adminSellerName,
                      labels: c.labels.filter((l) => !l.startsWith('Asignado:')).concat(`Asignado: ${adminSellerName.split(' ')[0]}`),
                    }
                  : c
              )
            );
          } else if (type === 'STATUS_UPDATE') {
            const { chatId, status, lastResponseAt } = data;
            setConversations((prev) =>
              prev.map((c) => (c.id === chatId ? { ...c, status, lastResponseAt } : c))
            );
          } else if (type === 'ASSIGNMENT_UPDATE') {
            const { chatId, conversation } = data;
            if (conversation) {
              setConversations((prev) =>
                prev.map((c) => (c.id === chatId ? { ...c, ...conversation } : c))
              );
            }
          } else if (type === 'MESSAGE') {
            const msg: Message = data;
            if (msg && msg.chatId) {
              addMessageToChat(msg.chatId, msg);
            }
          }
        } catch (e) {
          console.error('[LuboChat Frontend] Error handling WS message:', e);
        }
      };

      ws.onclose = () => {
        console.log('[LuboChat Frontend] WebSocket closed');
      };
    } catch (e) {
      console.warn('[LuboChat Frontend] WebSocket init skipped:', e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Broadcast Presence: Viewing Active Chat
  useEffect(() => {
    if (!activeChatId || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Send Viewing Event
    wsRef.current.send(
      JSON.stringify({
        type: 'VIEWING',
        data: {
          chatId: activeChatId,
          sellerId: activeSeller.id,
          sellerName: activeSeller.name,
          isViewing: true,
        },
      })
    );

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'VIEWING',
            data: {
              chatId: activeChatId,
              sellerId: activeSeller.id,
              sellerName: activeSeller.name,
              isViewing: false,
            },
          })
        );
      }
    };
  }, [activeChatId, activeSeller.id]);

  useEffect(() => {
    whatsappService.current.setConfig(waConfig);
  }, [waConfig]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const activeConversation = conversations.find((c) => c.id === activeChatId) || null;
  const activeMessages = activeChatId ? messagesMap[activeChatId] || [] : [];
  const unreadNewCount = conversations.filter(
    (c) => c.status === 'NEW' || c.isNewChat || c.labels.includes('CHAT NUEVO')
  ).length;
  const unassignedCount = conversations.filter((c) => !c.assignedSellerId).length;
  const closedCount = conversations.filter((c) => c.status === 'CLOSED').length;
  const myChatsCount = conversations.filter((c) => c.assignedSellerId === activeSeller.id).length;

  const filteredConversations = conversations.filter((c) => {
    if (activeFilter === 'mine') {
      return c.assignedSellerId === activeSeller.id;
    }
    if (activeFilter === 'new') {
      return c.status === 'NEW' || c.isNewChat || c.labels.includes('CHAT NUEVO');
    }
    if (activeFilter === 'unassigned') {
      return !c.assignedSellerId;
    }
    if (activeFilter === 'closed') {
      return c.status === 'CLOSED';
    }
    return true;
  });

  // Timeline & Activity Logging Helper
  const addActivityEvent = (
    chatId: string,
    type: ActivityEventType,
    title: string,
    description: string,
    actorNameOverride?: string
  ) => {
    const newEvent: ActivityEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      chatId,
      type,
      title,
      description,
      actorName: actorNameOverride || activeSeller.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtIso: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const updatedTimeline = [newEvent, ...(c.activityTimeline || [])];
          return { ...c, activityTimeline: updatedTimeline };
        }
        return c;
      })
    );
  };

  // Transfer Chat Between Sellers with Rich Context
  const handleTransferChat = (
    chatIdOrPayload: string | { chatId: string; targetSellerId: string; reason?: string; contextNote?: string },
    optionalTargetSellerId?: string
  ) => {
    let chatId = '';
    let targetSellerId = '';
    let reason = 'Reasignación Comercial';
    let contextNote = '';

    if (typeof chatIdOrPayload === 'string') {
      chatId = chatIdOrPayload;
      targetSellerId = optionalTargetSellerId || '';
    } else {
      chatId = chatIdOrPayload.chatId;
      targetSellerId = chatIdOrPayload.targetSellerId;
      reason = chatIdOrPayload.reason || reason;
      contextNote = chatIdOrPayload.contextNote || '';
    }

    const targetSeller = sellers.find((s) => s.id === targetSellerId);
    if (!targetSeller) return;

    const sourceSellerName = activeSeller.name;
    const targetSellerName = targetSeller.name;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const cleanedLabels = c.labels
            .filter((l) => !l.startsWith('Asignado:'))
            .concat(`Asignado: ${targetSellerName.split(' ')[0]}`);

          return {
            ...c,
            assignedSellerId: targetSeller.id,
            assignedSellerName: targetSeller.name,
            assignedAt: new Date().toISOString(),
            status: 'ASSIGNED',
            labels: cleanedLabels,
          };
        }
        return c;
      })
    );

    const sysContent = contextNote
      ? `💬 Chat transferido de ${sourceSellerName} a ${targetSellerName}.\nMotivo: ${reason}\nNota de contexto: "${contextNote}"`
      : `${sourceSellerName} transfirió esta conversación a ${targetSellerName}`;

    // Insert System Message
    const sysMsg: Message = {
      id: `sys_${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'Sistema',
      type: 'system',
      content: sysContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTimestamp: `Hoy a las ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: 'read',
      fromMe: false,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), sysMsg],
    }));

    // Log Activity Event
    addActivityEvent(
      chatId,
      'TRANSFERRED',
      `Transferido a ${targetSellerName}`,
      `Motivo: ${reason} ${contextNote ? `| Contexto: ${contextNote}` : ''}`
    );

    // Play Sound & Notification
    playNotificationSound();

    // WebSocket Notification
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'TRANSFER_CHAT',
          data: { chatId, sourceSellerName, targetSellerId, targetSellerName, reason, contextNote },
        })
      );
    }
  };

  // Close Conversation System
  const handleCloseChat = (payload: { chatId: string; outcome: 'CLOSED_WON' | 'CLOSED_LOST'; reasonNote: string }) => {
    const { chatId, outcome, reasonNote } = payload;
    const outcomeLabel = outcome === 'CLOSED_WON' ? 'CERRADO GANADO 🎉' : 'CERRADO PERDIDO ❌';
    const crmStage: CrmStage = outcome === 'CLOSED_WON' ? 'Ganado' : 'Perdido';

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            status: outcome,
            crmStage,
            contact: { ...c.contact, crmStage },
            lastResponseAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return c;
      })
    );

    const sysMsg: Message = {
      id: `sys_close_${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'Sistema',
      type: 'system',
      content: `🔒 Conversación finalizada como ${outcomeLabel}.\nResumen: "${reasonNote}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTimestamp: `Hoy a las ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: 'read',
      fromMe: false,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), sysMsg],
    }));

    addActivityEvent(
      chatId,
      'CLOSED',
      `Cierre: ${outcome === 'CLOSED_WON' ? 'Venta Ganada' : 'Venta Perdida'}`,
      `Resumen: ${reasonNote}`
    );
  };

  // Change CRM Stage
  const handleChangeCrmStage = (chatId: string, stage: CrmStage) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const updatedContact = { ...c.contact, crmStage: stage };
          return { ...c, crmStage: stage, contact: updatedContact };
        }
        return c;
      })
    );

    setContacts((prev) =>
      prev.map((ct) => {
        const matchingConv = conversations.find((c) => c.id === chatId);
        if (matchingConv && ct.id === matchingConv.contact.id) {
          return { ...ct, crmStage: stage };
        }
        return ct;
      })
    );

    addActivityEvent(chatId, 'CRM_STAGE_CHANGED', 'Etapa CRM Actualizada', `Cambió a: ${stage}`);
  };

  // Follow-Up Reminders
  const handleAddReminder = (chatId: string, reminderTimeText: string, noteText: string) => {
    const newReminder: FollowUpReminder = {
      id: `rem_${Date.now()}`,
      chatId,
      reminderTime: reminderTimeText,
      dueTimestamp: Date.now() + 3600000,
      note: noteText,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCompleted: false,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const current = c.reminders || [];
          return { ...c, reminders: [...current, newReminder] };
        }
        return c;
      })
    );

    addActivityEvent(
      chatId,
      'REMINDER_SET',
      'Recordatorio Creado',
      `Programado para ${reminderTimeText}: "${noteText}"`
    );
  };

  const handleCompleteReminder = (chatId: string, reminderId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId && c.reminders) {
          return {
            ...c,
            reminders: c.reminders.map((r) => (r.id === reminderId ? { ...r, isCompleted: true } : r)),
          };
        }
        return c;
      })
    );
  };

  // Quick Responses Handlers
  const handleAddQuickResponse = (qr: Omit<QuickResponse, 'id'>) => {
    const newQr: QuickResponse = {
      ...qr,
      id: `qr_${Date.now()}`,
    };
    setQuickResponses((prev) => [...prev, newQr]);
  };

  const handleDeleteQuickResponse = (id: string) => {
    setQuickResponses((prev) => prev.filter((q) => q.id !== id));
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    setMessagesMap((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message],
    }));

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === chatId) {
          return {
            ...conv,
            lastMessage: message,
            updatedAt: message.timestamp,
            lastResponseAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: chatId === activeChatId ? 0 : conv.unreadCount + 1,
          };
        }
        return conv;
      })
    );
  };

  // SMART CHAT ASSIGNMENT ENGINE CALCULATOR
  const calculateNextSellerForAssignment = (): Seller | null => {
    const activeVendedores = sellers.filter((s) => s.role === 'vendedor' && s.isActive);
    if (activeVendedores.length === 0) return null;

    if (distributionConfig.mode === 'percentage') {
      let chosen = activeVendedores[0];
      let minRatio = Infinity;

      for (const seller of activeVendedores) {
        const weight = seller.assignedPercentage || 1;
        const ratio = seller.assignedChatsCount / weight;
        if (ratio < minRatio) {
          minRatio = ratio;
          chosen = seller;
        }
      }
      return chosen;
    } else if (distributionConfig.mode === 'quota_round_robin') {
      let chosen = activeVendedores[0];
      for (const seller of activeVendedores) {
        if (seller.assignedChatsCount % (distributionConfig.totalQuota || 10) < seller.quotaOutOfTen) {
          chosen = seller;
          break;
        }
      }
      return chosen;
    }

    return activeVendedores[0];
  };

  // SIMULATE NEW INBOUND CHAT
  const handleSimulateInboundChat = () => {
    const randomId = Date.now();
    const names = ['Valentina Torres', 'Andrés Restrepo', 'Camila Morales', 'Felipe Mendoza', 'Mariana Ospina'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const phone = `+57 31${Math.floor(Math.random() * 8 + 1)} ${Math.floor(Math.random() * 899 + 100)} ${Math.floor(Math.random() * 8990 + 1000)}`;
    const newChatId = `chat_${randomId}`;
    const contactId = `c_${randomId}`;

    const assignedSeller = calculateNextSellerForAssignment();

    const newContact: Contact = {
      id: contactId,
      name: `${randomName} (Nuevo)`,
      phoneNumber: phone,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=300&q=80`,
      about: 'Cliente Inbound WhatsApp',
      tags: ['CHAT NUEVO'],
      assignedSellerId: assignedSeller?.id,
      assignedSellerName: assignedSeller?.name,
      isOnline: true,
      notes: [],
    };

    const newConv: Conversation = {
      id: newChatId,
      contact: newContact,
      isGroup: false,
      unreadCount: 1,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      isFavorite: false,
      labels: ['CHAT NUEVO', assignedSeller ? `Asignado: ${assignedSeller.name.split(' ')[0]}` : 'Sin Asignar'],
      assignedSellerId: assignedSeller?.id,
      assignedSellerName: assignedSeller?.name,
      assignedAt: assignedSeller ? new Date().toISOString() : undefined,
      status: assignedSeller ? 'ASSIGNED' : 'NEW',
      isNewChat: true,
      updatedAt: 'Ahora',
    };

    if (assignedSeller) {
      setSellers((prev) =>
        prev.map((s) => (s.id === assignedSeller.id ? { ...s, assignedChatsCount: s.assignedChatsCount + 1 } : s))
      );
    }

    setContacts([newContact, ...contacts]);
    setConversations([newConv, ...conversations]);
    setActiveChatId(newChatId);

    const initialMsg: Message = {
      id: `m_${randomId}`,
      chatId: newChatId,
      senderId: contactId,
      senderName: randomName,
      type: 'text',
      content: '¡Hola! Escribo al WhatsApp oficial de la empresa para solicitar información.',
      timestamp: 'Ahora',
      fullTimestamp: 'Hoy a las ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      fromMe: false,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [newChatId]: [initialMsg],
    }));
  };

  // Broadcast Typing Presence
  const handleUserTyping = (isTyping: boolean) => {
    if (!activeChatId || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        type: 'TYPING',
        data: {
          chatId: activeChatId,
          sellerId: activeSeller.id,
          sellerName: activeSeller.name,
          isTyping,
        },
      })
    );
  };

  // Lock Chat / Anti-Collision
  const handleLockChat = (chatId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'LOCK_CHAT',
          data: {
            chatId,
            sellerId: activeSeller.id,
            sellerName: activeSeller.name,
          },
        })
      );
    }

    fetch(`/api/conversations/${chatId}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId: activeSeller.id,
        sellerName: activeSeller.name,
        action: 'lock',
      }),
    }).catch(() => {});
  };

  const handleUnlockChat = (chatId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'UNLOCK_CHAT',
          data: { chatId },
        })
      );
    }

    fetch(`/api/conversations/${chatId}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId: activeSeller.id,
        sellerName: activeSeller.name,
        action: 'unlock',
      }),
    }).catch(() => {});
  };

  // Admin Takeover
  const handleAdminTakeover = (chatId: string) => {
    if (activeSeller.role !== 'admin') return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'TAKEOVER',
          data: {
            chatId,
            adminSellerId: activeSeller.id,
            adminSellerName: activeSeller.name,
          },
        })
      );
    }

    fetch(`/api/conversations/${chatId}/takeover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminSellerId: activeSeller.id,
        adminSellerName: activeSeller.name,
      }),
    }).catch(() => {});

    setConversations((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              assignedSellerId: activeSeller.id,
              assignedSellerName: activeSeller.name,
              assignedAt: new Date().toISOString(),
              status: 'IN_PROGRESS',
              lockedBySellerId: activeSeller.id,
              lockedBySellerName: activeSeller.name,
              labels: c.labels.filter((l) => !l.startsWith('Asignado:')).concat(`Asignado: ${activeSeller.name.split(' ')[0]}`),
            }
          : c
      )
    );
  };

  // Change Status (NEW -> ASSIGNED -> IN_PROGRESS -> WAITING_CUSTOMER -> CLOSED)
  const handleChangeConversationStatus = (chatId: string, status: ConversationStatus) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              status,
              lastResponseAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : c
      )
    );

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'STATUS_UPDATE',
          data: { chatId, status, lastResponseAt: new Date().toISOString() },
        })
      );
    }

    fetch(`/api/conversations/${chatId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, sellerId: activeSeller.id }),
    }).catch(() => {});
  };

  // SEND MESSAGE & AUTO-CLAIMING WORKFLOW
  const handleSendMessage = async (params: {
    type: MessageType;
    content: string;
    mediaUrl?: string;
    fileName?: string;
    fileSize?: string;
    location?: { lat: number; lng: number; name: string; address: string };
    replyToId?: string;
  }) => {
    if (!activeConversation) return;

    // Release typing
    handleUserTyping(false);

    // Auto-Claiming check
    if (distributionConfig.autoAssignOnReply && (activeConversation.isNewChat || !activeConversation.assignedSellerId)) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            const updatedLabels = c.labels
              .filter((l) => l !== 'CHAT NUEVO')
              .concat(`Asignado: ${activeSeller.name.split(' ')[0]}`);
            return {
              ...c,
              isNewChat: false,
              assignedSellerId: activeSeller.id,
              assignedSellerName: activeSeller.name,
              assignedAt: new Date().toISOString(),
              status: 'IN_PROGRESS',
              labels: updatedLabels,
            };
          }
          return c;
        })
      );

      setSellers((prev) =>
        prev.map((s) => (s.id === activeSeller.id ? { ...s, assignedChatsCount: s.assignedChatsCount + 1 } : s))
      );

      fetch(`/api/conversations/${activeConversation.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: activeSeller.id, sellerName: activeSeller.name }),
      }).catch(() => {});
    }

    const newMessage = await whatsappService.current.sendMessage({
      toPhoneNumber: activeConversation.contact.phoneNumber,
      chatId: activeConversation.id,
      type: params.type,
      content: params.content,
      mediaUrl: params.mediaUrl,
      fileName: params.fileName,
      fileSize: params.fileSize,
      location: params.location,
      replyToId: params.replyToId,
    });

    const fullMsg = {
      ...newMessage,
      senderId: activeSeller.id,
      senderName: activeSeller.name,
    };

    addMessageToChat(activeConversation.id, fullMsg);
    setReplyingToMessage(null);

    // Update status to IN_PROGRESS
    handleChangeConversationStatus(activeConversation.id, 'IN_PROGRESS');

    // Broadcast message over WS
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'MESSAGE',
          data: fullMsg,
        })
      );
    }

    // Simulation Engine
    if (waConfig.mode === 'simulation' && !activeConversation.isGroup) {
      SimulationEngine.triggerSimulatedReply(
        activeConversation,
        params.content,
        (chatId, isTyping) => {
          setConversations((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, contact: { ...c.contact, isTyping } } : c))
          );
        },
        (replyMsg) => {
          addMessageToChat(activeConversation.id, replyMsg);
          handleChangeConversationStatus(activeConversation.id, 'WAITING_CUSTOMER');
        }
      );
    }
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setConversations((prev) =>
      prev.map((conv) => (conv.id === chatId ? { ...conv, unreadCount: 0 } : conv))
    );
  };

  const handleReassignChat = (chatId: string, targetSellerId: string) => {
    const targetSeller = sellers.find((s) => s.id === targetSellerId);
    if (!targetSeller) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const newLabels = c.labels
            .filter((l) => !l.startsWith('Asignado:'))
            .concat(`Asignado: ${targetSeller.name.split(' ')[0]}`);
          return {
            ...c,
            assignedSellerId: targetSeller.id,
            assignedSellerName: targetSeller.name,
            assignedAt: new Date().toISOString(),
            status: 'ASSIGNED',
            labels: newLabels,
          };
        }
        return c;
      })
    );

    fetch(`/api/conversations/${chatId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: targetSeller.id, sellerName: targetSeller.name }),
    }).catch(() => {});
  };

  const handleAddContactNote = (contactId: string, noteText: string) => {
    const newNote: ContactNote = {
      id: `note_${Date.now()}`,
      contactId,
      authorId: activeSeller.id,
      authorName: activeSeller.name,
      text: noteText,
      createdAt: 'Ahora',
    };

    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, notes: [newNote, ...(c.notes || [])] } : c))
    );
  };

  const handleSaveContact = (contactPartial: Partial<Contact>) => {
    const newContact: Contact = {
      id: `c_${Date.now()}`,
      name: contactPartial.name || 'Nuevo Contacto',
      phoneNumber: contactPartial.phoneNumber || '+57 300 000 0000',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
      email: contactPartial.email,
      company: contactPartial.company,
      tags: contactPartial.tags || ['Cliente Empresarial'],
      isOnline: true,
      notes: [],
    };
    setContacts([newContact, ...contacts]);
  };

  const handleTogglePin = (chatId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleToggleMute = (chatId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isMuted: !c.isMuted } : c))
    );
  };

  const handleMarkUnread = (chatId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 1 } : c))
    );
  };

  const handleDeleteChat = (chatId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const handleStartNewChat = (contact: Contact) => {
    const existing = conversations.find((c) => c.contact.id === contact.id);
    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newChatId = `chat_${Date.now()}`;
      const newConv: Conversation = {
        id: newChatId,
        contact,
        isGroup: false,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isArchived: false,
        isFavorite: false,
        labels: ['CHAT NUEVO'],
        isNewChat: true,
        status: 'NEW',
        updatedAt: 'Ahora',
      };
      setConversations([newConv, ...conversations]);
      setActiveChatId(newChatId);
    }
  };

  return {
    // Role & Sellers
    sellers,
    setSellers,
    activeSellerId,
    setActiveSellerId,
    activeSeller,
    distributionConfig,
    setDistributionConfig,

    // Filter
    activeFilter,
    setActiveFilter,
    filteredConversations,
    unreadNewCount,
    unassignedCount,
    closedCount,
    myChatsCount,

    // Quick Responses
    quickResponses,
    handleAddQuickResponse,
    handleDeleteQuickResponse,

    // Notifications
    notificationSettings,
    setNotificationSettings,
    playNotificationSound,

    // CRM & Team Collaboration Actions
    handleTransferChat,
    handleCloseChat,
    handleChangeCrmStage,
    handleAddReminder,
    handleCompleteReminder,

    // Contacts
    contacts,
    handleAddContactNote,
    handleSaveContact,

    // Real-time Presence & Anti-collision locking
    handleUserTyping,
    handleLockChat,
    handleUnlockChat,
    handleAdminTakeover,
    handleChangeConversationStatus,

    // Core WhatsApp
    conversations,
    activeChatId,
    activeConversation,
    activeMessages,
    userProfile,
    waConfig,
    templates,
    stories,
    darkMode,
    replyingToMessage,

    // Drawers & Modals
    drawerProfileOpen,
    drawerSettingsOpen,
    drawerStatusOpen,
    drawerNewChatOpen,
    drawerInfoOpen,
    modalDistributionOpen,
    drawerContactsOpen,

    setDrawerProfileOpen,
    setDrawerSettingsOpen,
    setDrawerStatusOpen,
    setDrawerNewChatOpen,
    setDrawerInfoOpen,
    setModalDistributionOpen,
    setDrawerContactsOpen,
    setReplyingToMessage,

    setUserProfile,
    setWaConfig,
    setDarkMode,

    // Actions
    handleSendMessage,
    handleSelectChat,
    handleReassignChat,
    handleSimulateInboundChat,
    handleTogglePin,
    handleToggleMute,
    handleMarkUnread,
    handleDeleteChat,
    handleStartNewChat,
  };
}
