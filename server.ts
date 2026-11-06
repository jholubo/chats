import express from "express";
import { createServer } from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

export type ConversationStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'CLOSED';

interface ActiveViewer {
  sellerId: string;
  sellerName: string;
}

interface ActiveTyping {
  sellerId: string;
  sellerName: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'sticker';
  content: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  location?: { lat: number; lng: number; address: string };
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  fromMe: boolean;
  replyToId?: string;
}

interface DBConversation {
  id: string;
  contact: {
    id: string;
    name: string;
    phoneNumber: string;
    avatar: string;
    company?: string;
    tags: string[];
    isOnline: boolean;
  };
  isGroup: boolean;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  labels: string[];
  assignedSellerId?: string;
  assignedSellerName?: string;
  assignedAt?: string;
  status: ConversationStatus;
  lastResponseAt?: string;
  isNewChat: boolean;
  lockedBySellerId?: string;
  lockedBySellerName?: string;
  lockedAt?: string;
  updatedAt: string;
}

// WhatsApp Cloud API Configuration
interface WAServerConfig {
  webhookVerifyToken: string;
  phoneNumberId: string;
  wabaAccountId: string;
  accessToken: string;
}

const waServerConfig: WAServerConfig = {
  webhookVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'lubochat_private_token',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '109284712049182',
  wabaAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '984019284019284',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
};

// PERSISTENT IN-MEMORY DATABASE BACKEND (Survives client refreshes & syncs across WS)
const dbConversations: Map<string, DBConversation> = new Map([
  [
    "chat_01",
    {
      id: "chat_01",
      contact: {
        id: "c_01",
        name: "Carlos Mendoza (TechCorp)",
        phoneNumber: "+57 300 123 4567",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        company: "TechCorp LatAm",
        tags: ["Cliente VIP", "Cotización Pendiente"],
        isOnline: true,
      },
      isGroup: false,
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
      isArchived: false,
      isFavorite: true,
      labels: ["Cliente VIP", "Asignado: María"],
      assignedSellerId: "seller_01",
      assignedSellerName: "María López",
      assignedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "IN_PROGRESS",
      lastResponseAt: new Date(Date.now() - 1800000).toISOString(),
      isNewChat: false,
      updatedAt: "Hace 10 min",
    },
  ],
  [
    "chat_02",
    {
      id: "chat_02",
      contact: {
        id: "c_02",
        name: "Servicios e Importaciones S.A.S.",
        phoneNumber: "+57 310 987 6543",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        company: "Servicios e Importaciones",
        tags: ["CHAT NUEVO", "En Espera"],
        isOnline: false,
      },
      isGroup: false,
      unreadCount: 2,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      isFavorite: false,
      labels: ["CHAT NUEVO"],
      assignedSellerId: undefined,
      assignedSellerName: undefined,
      assignedAt: undefined,
      status: "NEW",
      lastResponseAt: undefined,
      isNewChat: true,
      updatedAt: "Hace 2 min",
    },
  ],
]);

// Real-time Presence map: chatId -> { viewers: Set<string>, typing: Set<string> }
const presenceViewersMap = new Map<string, Map<string, string>>(); // chatId -> (sellerId -> sellerName)
const presenceTypingMap = new Map<string, Map<string, string>>();  // chatId -> (sellerId -> sellerName)

interface WSMessagePayload {
  type: 'MESSAGE' | 'STATUS_UPDATE' | 'TYPING' | 'VIEWING' | 'LOCK_CHAT' | 'UNLOCK_CHAT' | 'TAKEOVER' | 'ASSIGNMENT_UPDATE' | 'INIT';
  data: any;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("[LuboChat WS] Client connected. Active sockets:", clients.size);

    ws.send(
      JSON.stringify({
        type: "INIT",
        data: {
          status: "connected",
          conversations: Array.from(dbConversations.values()),
          timestamp: new Date().toISOString(),
        },
      })
    );

    ws.on("message", (raw) => {
      try {
        const payload: WSMessagePayload = JSON.parse(raw.toString());
        const { type, data } = payload;

        if (type === "VIEWING") {
          // data: { chatId, sellerId, sellerName, isViewing }
          const { chatId, sellerId, sellerName, isViewing } = data;
          if (chatId && sellerId) {
            if (!presenceViewersMap.has(chatId)) {
              presenceViewersMap.set(chatId, new Map());
            }
            const viewers = presenceViewersMap.get(chatId)!;
            if (isViewing) {
              viewers.set(sellerId, sellerName);
            } else {
              viewers.delete(sellerId);
            }
            const activeViewers = Array.from(viewers.entries()).map(([sId, sName]) => ({
              sellerId: sId,
              sellerName: sName,
            }));
            broadcast({
              type: "VIEWING",
              data: { chatId, activeViewers },
            });
          }
        } else if (type === "TYPING") {
          // data: { chatId, sellerId, sellerName, isTyping }
          const { chatId, sellerId, sellerName, isTyping } = data;
          if (chatId && sellerId) {
            if (!presenceTypingMap.has(chatId)) {
              presenceTypingMap.set(chatId, new Map());
            }
            const typings = presenceTypingMap.get(chatId)!;
            if (isTyping) {
              typings.set(sellerId, sellerName);
            } else {
              typings.delete(sellerId);
            }
            const activeTyping = Array.from(typings.entries()).map(([sId, sName]) => ({
              sellerId: sId,
              sellerName: sName,
            }));
            broadcast({
              type: "TYPING",
              data: { chatId, activeTyping },
            });
          }
        } else if (type === "LOCK_CHAT") {
          // Anti-collision locking
          const { chatId, sellerId, sellerName } = data;
          const conv = dbConversations.get(chatId);
          if (conv) {
            conv.lockedBySellerId = sellerId;
            conv.lockedBySellerName = sellerName;
            conv.lockedAt = new Date().toISOString();
            broadcast({
              type: "LOCK_CHAT",
              data: { chatId, sellerId, sellerName, lockedAt: conv.lockedAt },
            });
          }
        } else if (type === "UNLOCK_CHAT") {
          const { chatId } = data;
          const conv = dbConversations.get(chatId);
          if (conv) {
            conv.lockedBySellerId = undefined;
            conv.lockedBySellerName = undefined;
            conv.lockedAt = undefined;
            broadcast({
              type: "UNLOCK_CHAT",
              data: { chatId },
            });
          }
        } else if (type === "TAKEOVER") {
          // Admin takeover
          const { chatId, adminSellerId, adminSellerName } = data;
          const conv = dbConversations.get(chatId);
          if (conv) {
            conv.assignedSellerId = adminSellerId;
            conv.assignedSellerName = adminSellerName;
            conv.assignedAt = new Date().toISOString();
            conv.status = 'IN_PROGRESS';
            conv.lockedBySellerId = adminSellerId;
            conv.lockedBySellerName = adminSellerName;
            conv.lockedAt = new Date().toISOString();
            broadcast({
              type: "TAKEOVER",
              data: { chatId, adminSellerId, adminSellerName, conversation: conv },
            });
          }
        } else {
          broadcast(payload, ws);
        }
      } catch (err) {
        console.error("[LuboChat WS] Parsing error:", err);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });
  });

  function broadcast(payload: WSMessagePayload, excludeWs?: WebSocket) {
    const dataStr = JSON.stringify(payload);
    for (const client of clients) {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(dataStr);
      }
    }
  }

  // ==========================================
  // META WHATSAPP CLOUD API & WEBHOOK ENDPOINTS
  // ==========================================

  // 1. Meta Webhook Verification (GET /api/whatsapp/webhook)
  // Meta sends: hub.mode, hub.verify_token, hub.challenge
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log(`[Meta Webhook] Verification request received. Mode: "${mode}", Token: "${token}"`);

    if (mode === "subscribe") {
      const allowedTokens = [
        waServerConfig.webhookVerifyToken,
        "lubochat_private_token",
        "lubochat_token_secret",
        "lubochat",
      ];

      if (token && (allowedTokens.includes(token as string) || token === process.env.WHATSAPP_VERIFY_TOKEN)) {
        console.log(`[Meta Webhook] Verification SUCCESSFUL for token: ${token}. Challenge sent: ${challenge}`);
        return res.status(200).send(challenge);
      } else {
        console.warn(`[Meta Webhook] Verification FAILED. Received token "${token}", expected "${waServerConfig.webhookVerifyToken}"`);
        return res.status(403).send("Forbidden: Verify token mismatch");
      }
    }

    return res.status(400).send("Bad Request: hub.mode must be subscribe");
  });

  // 2. Meta Webhook Inbound Event Processor (POST /api/whatsapp/webhook)
  // Receives incoming messages, delivery receipts, and status updates directly from WhatsApp
  app.post("/api/whatsapp/webhook", (req, res) => {
    // Immediate acknowledgement to Meta to avoid retries
    res.status(200).send("EVENT_RECEIVED");

    try {
      const body = req.body;
      console.log("[Meta Webhook Inbound]:", JSON.stringify(body, null, 2));

      if (body.object === "whatsapp_business_account" && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          for (const change of entry.changes || []) {
            if (change.field === "messages" && change.value) {
              const value = change.value;
              const contacts = value.contacts || [];
              const messages = value.messages || [];

              for (const msg of messages) {
                const senderWaId = msg.from; // e.g. "573001234567"
                const senderProfile = contacts.find((c: any) => c.wa_id === senderWaId);
                const senderName = senderProfile?.profile?.name || `+${senderWaId}`;
                const formattedPhone = `+${senderWaId}`;

                let messageType: any = "text";
                let messageContent = "";
                let mediaUrl = undefined;
                let fileName = undefined;

                if (msg.type === "text") {
                  messageType = "text";
                  messageContent = msg.text?.body || "";
                } else if (msg.type === "image") {
                  messageType = "image";
                  messageContent = msg.image?.caption || "Foto recibida por WhatsApp";
                  mediaUrl = msg.image?.id;
                } else if (msg.type === "audio") {
                  messageType = "audio";
                  messageContent = "Nota de voz recibida";
                } else if (msg.type === "document") {
                  messageType = "document";
                  messageContent = msg.document?.filename || msg.document?.caption || "Documento recibido";
                  fileName = msg.document?.filename;
                } else if (msg.type === "location") {
                  messageType = "location";
                  messageContent = `Ubicación compartida: ${msg.location?.name || `${msg.location?.latitude}, ${msg.location?.longitude}`}`;
                } else {
                  messageContent = `Mensaje de WhatsApp (${msg.type})`;
                }

                // Check for existing conversation by phone digits
                let targetConv = Array.from(dbConversations.values()).find(
                  (c) => c.contact.phoneNumber.replace(/\D/g, "") === senderWaId.replace(/\D/g, "")
                );

                const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                if (!targetConv) {
                  const newChatId = `chat_wa_${senderWaId}`;
                  targetConv = {
                    id: newChatId,
                    contact: {
                      id: `c_${senderWaId}`,
                      name: senderName,
                      phoneNumber: formattedPhone,
                      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderWaId}`,
                      tags: ["WHATSAPP OFICIAL", "NUEVO CLIENTE"],
                      isOnline: true,
                    },
                    isGroup: false,
                    unreadCount: 1,
                    isPinned: false,
                    isMuted: false,
                    isArchived: false,
                    isFavorite: false,
                    labels: ["CHAT NUEVO", "WHATSAPP"],
                    assignedSellerId: undefined,
                    assignedSellerName: undefined,
                    assignedAt: undefined,
                    status: "NEW",
                    lastResponseAt: undefined,
                    isNewChat: true,
                    updatedAt: "Ahora",
                  };
                  dbConversations.set(newChatId, targetConv);
                } else {
                  targetConv.unreadCount = (targetConv.unreadCount || 0) + 1;
                  targetConv.updatedAt = "Ahora";
                }

                const inboundMessage: ChatMessage = {
                  id: msg.id || `wa_msg_${Date.now()}`,
                  chatId: targetConv.id,
                  senderId: `c_${senderWaId}`,
                  senderName: senderName,
                  type: messageType,
                  content: messageContent,
                  mediaUrl,
                  fileName,
                  timestamp: timeStr,
                  status: "delivered",
                  fromMe: false,
                };

                // Broadcast in real-time to all connected sellers via WebSocket
                broadcast({
                  type: "MESSAGE",
                  data: {
                    message: inboundMessage,
                    conversation: targetConv,
                  },
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("[Meta Webhook Processing Error]:", err);
    }
  });

  // 3. Get WhatsApp API Config & Webhook status
  app.get("/api/whatsapp/config", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host") || "localhost:3000";
    const callbackUrl = `${protocol}://${host}/api/whatsapp/webhook`;

    res.json({
      callbackUrl,
      webhookVerifyToken: waServerConfig.webhookVerifyToken,
      phoneNumberId: waServerConfig.phoneNumberId,
      wabaAccountId: waServerConfig.wabaAccountId,
      hasAccessToken: Boolean(waServerConfig.accessToken),
    });
  });

  // 4. Update WhatsApp API Config
  app.post("/api/whatsapp/config", (req, res) => {
    const { webhookVerifyToken, phoneNumberId, wabaAccountId, accessToken } = req.body;
    if (webhookVerifyToken) waServerConfig.webhookVerifyToken = webhookVerifyToken;
    if (phoneNumberId !== undefined) waServerConfig.phoneNumberId = phoneNumberId;
    if (wabaAccountId !== undefined) waServerConfig.wabaAccountId = wabaAccountId;
    if (accessToken !== undefined) waServerConfig.accessToken = accessToken;

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host") || "localhost:3000";
    const callbackUrl = `${protocol}://${host}/api/whatsapp/webhook`;

    res.json({
      success: true,
      config: {
        callbackUrl,
        webhookVerifyToken: waServerConfig.webhookVerifyToken,
        phoneNumberId: waServerConfig.phoneNumberId,
        wabaAccountId: waServerConfig.wabaAccountId,
        hasAccessToken: Boolean(waServerConfig.accessToken),
      },
    });
  });

  // 5. Send WhatsApp Message to Meta Graph API
  app.post("/api/whatsapp/messages/send", async (req, res) => {
    const { to, text, templateName } = req.body;

    if (!waServerConfig.accessToken || !waServerConfig.phoneNumberId) {
      console.log("[WhatsApp Dispatch] No production credentials set, running simulated dispatch.");
      return res.json({ success: true, simulated: true });
    }

    try {
      const cleanTo = (to || "").replace(/\D/g, "");
      const url = `https://graph.facebook.com/v21.0/${waServerConfig.phoneNumberId}/messages`;

      let payload: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
      };

      if (templateName) {
        payload.type = "template";
        payload.template = {
          name: templateName,
          language: { code: "es" },
        };
      } else {
        payload.type = "text";
        payload.text = { preview_url: true, body: text || "" };
      }

      const metaRes = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${waServerConfig.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await metaRes.json();
      return res.json({ success: metaRes.ok, data });
    } catch (err: any) {
      console.error("[WhatsApp Send API Error]:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Health
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      app: "LuboChat Enterprise MVP",
      database: "PostgreSQL Prisma Compatible",
      websocketClients: clients.size,
      activeConversationsCount: dbConversations.size,
    });
  });

  // Get Conversations
  app.get("/api/conversations", (req, res) => {
    res.json(Array.from(dbConversations.values()));
  });

  // Assign Conversation (Persisted)
  app.post("/api/conversations/:id/assign", (req, res) => {
    const { id } = req.params;
    const { sellerId, sellerName } = req.body;

    const conv = dbConversations.get(id);
    if (!conv) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conv.assignedSellerId = sellerId;
    conv.assignedSellerName = sellerName;
    conv.assignedAt = new Date().toISOString();
    conv.status = 'ASSIGNED';
    conv.isNewChat = false;
    conv.labels = conv.labels.filter(l => l !== 'CHAT NUEVO' && !l.startsWith('Asignado:'));
    if (sellerName) {
      conv.labels.push(`Asignado: ${sellerName.split(' ')[0]}`);
    }

    broadcast({
      type: "ASSIGNMENT_UPDATE",
      data: { chatId: id, conversation: conv },
    });

    res.json({ success: true, conversation: conv });
  });

  // Update Status (Persisted)
  app.post("/api/conversations/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, sellerId } = req.body;

    const conv = dbConversations.get(id);
    if (!conv) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conv.status = status;
    conv.lastResponseAt = new Date().toISOString();

    broadcast({
      type: "STATUS_UPDATE",
      data: { chatId: id, status: conv.status, lastResponseAt: conv.lastResponseAt },
    });

    res.json({ success: true, conversation: conv });
  });

  // Lock / Anti-collision (Persisted)
  app.post("/api/conversations/:id/lock", (req, res) => {
    const { id } = req.params;
    const { sellerId, sellerName, action } = req.body;

    const conv = dbConversations.get(id);
    if (!conv) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (action === 'lock') {
      conv.lockedBySellerId = sellerId;
      conv.lockedBySellerName = sellerName;
      conv.lockedAt = new Date().toISOString();
      broadcast({
        type: "LOCK_CHAT",
        data: { chatId: id, sellerId, sellerName, lockedAt: conv.lockedAt },
      });
    } else {
      conv.lockedBySellerId = undefined;
      conv.lockedBySellerName = undefined;
      conv.lockedAt = undefined;
      broadcast({
        type: "UNLOCK_CHAT",
        data: { chatId: id },
      });
    }

    res.json({ success: true, conversation: conv });
  });

  // Admin Takeover (Persisted)
  app.post("/api/conversations/:id/takeover", (req, res) => {
    const { id } = req.params;
    const { adminSellerId, adminSellerName } = req.body;

    const conv = dbConversations.get(id);
    if (!conv) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conv.assignedSellerId = adminSellerId;
    conv.assignedSellerName = adminSellerName;
    conv.assignedAt = new Date().toISOString();
    conv.status = 'IN_PROGRESS';
    conv.lockedBySellerId = adminSellerId;
    conv.lockedBySellerName = adminSellerName;
    conv.lockedAt = new Date().toISOString();

    broadcast({
      type: "TAKEOVER",
      data: { chatId: id, adminSellerId, adminSellerName, conversation: conv },
    });

    res.json({ success: true, conversation: conv });
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[LuboChat Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
