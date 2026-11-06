export type MessageType = 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'document' 
  | 'location' 
  | 'sticker' 
  | 'contact'
  | 'system';

export type ChatFilterTab = 'all' | 'mine' | 'new' | 'unassigned' | 'closed';

export type CrmStage = 'Nuevo' | 'Contactado' | 'Cotización' | 'Negociación' | 'Ganado' | 'Perdido';

export interface QuickResponse {
  id: string;
  shortcut: string;
  text: string;
  category?: string;
}

export interface FollowUpReminder {
  id: string;
  chatId: string;
  reminderTime: string;
  dueTimestamp: number;
  note: string;
  createdAt: string;
  isCompleted: boolean;
}

export type ActivityEventType =
  | 'CHAT_CREATED'
  | 'AUTO_ASSIGNED'
  | 'TAKEN_BY_SELLER'
  | 'TRANSFERRED'
  | 'STATUS_CHANGED'
  | 'CLOSED'
  | 'REOPENED'
  | 'REMINDER_SET'
  | 'CRM_STAGE_CHANGED';

export interface ActivityEvent {
  id: string;
  chatId: string;
  type: ActivityEventType;
  title: string;
  description: string;
  actorName: string;
  timestamp: string;
  createdAtIso: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export interface MediaMeta {
  url?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
}

export interface MessageReaction {
  emoji: string;
  fromMe: boolean;
  senderName: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  media?: MediaMeta;
  location?: LocationData;
  timestamp: string;
  fullTimestamp?: string;
  status: MessageStatus;
  fromMe: boolean;
  isStarred?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    type: MessageType;
  };
  reactions?: MessageReaction[];
}

export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  about: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  customStatus?: string;
  role: 'admin' | 'vendedor';
}

export interface ContactNote {
  id: string;
  contactId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar: string;
  about?: string;
  email?: string;
  company?: string;
  tags: string[];
  notes?: ContactNote[];
  crmStage?: CrmStage;
  assignedSellerId?: string;
  assignedSellerName?: string;
  waSyncStatus?: 'synced' | 'pending';
  isOnline: boolean;
  lastSeen?: string;
  isTyping?: boolean;
  isBusiness?: boolean;
  businessInfo?: {
    category: string;
    email: string;
    website: string;
    description: string;
  };
}

export type ConversationStatus = 
  | 'NEW' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'WAITING_CUSTOMER' 
  | 'CLOSED' 
  | 'CLOSED_WON' 
  | 'CLOSED_LOST';

export interface NotificationSettings {
  soundEnabled: boolean;
  browserAlertsEnabled: boolean;
  slaMinutesAlert: number; // minutes before SLA warning triggers
  alertOnUnassigned: boolean;
}

export interface TransferPayload {
  chatId: string;
  targetSellerId: string;
  reason: string;
  contextNote: string;
}

export interface CloseChatPayload {
  chatId: string;
  outcome: 'CLOSED_WON' | 'CLOSED_LOST';
  reasonNote: string;
}

export interface ActiveViewer {
  sellerId: string;
  sellerName: string;
}

export interface ActiveTyping {
  sellerId: string;
  sellerName: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupMembers?: Contact[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  labels: string[];
  assignedSellerId?: string;
  assignedSellerName?: string;
  assignedAt?: string;
  status?: ConversationStatus;
  crmStage?: CrmStage;
  reminders?: FollowUpReminder[];
  activityTimeline?: ActivityEvent[];
  lastResponseAt?: string;
  isNewChat?: boolean;
  lockedBySellerId?: string;
  lockedBySellerName?: string;
  lockedAt?: string;
  activeViewers?: ActiveViewer[];
  activeTyping?: ActiveTyping[];
  updatedAt: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'vendedor';
  status: 'online' | 'offline' | 'busy';
  assignedPercentage: number; // e.g., 50 for 50%
  quotaOutOfTen: number;     // e.g., 5 for 5 out of 10
  assignedChatsCount: number;
  isActive: boolean;
}

export type DistributionMode = 'percentage' | 'quota_round_robin' | 'manual';

export interface DistributionConfig {
  mode: DistributionMode;
  totalQuota: number; // Default 10
  autoTagNewChat: boolean; // Tag "CHAT NUEVO" when inbound
  autoAssignOnReply: boolean; // Auto assign seller on reply
  sellers: Seller[];
}

export interface WhatsAppConfig {
  mode: 'simulation' | 'cloud_api';
  phoneNumberId: string;
  wabaAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  autoReplyEnabled: boolean;
  autoReplyGreeting: string;
  aiSmartAssistant: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  headerType: 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT';
  body: string;
  footer?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface UserStatusStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
  isViewed: boolean;
  type: 'image' | 'video' | 'text';
  backgroundColor?: string;
}

// Enterprise / SaaS compatibility definitions
export type CRMStage = CrmStage;

export interface AIAgentConfig {
  id: string;
  name: string;
  prompt: string;
  isActive: boolean;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
}

export interface AnalyticsMetric {
  id: string;
  label: string;
  value: string | number;
}

export interface AgentPerformance {
  sellerId: string;
  name: string;
  chatsHandled: number;
  avgResponseTimeSecs: number;
}

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
}

export interface CopilotSuggestion {
  id: string;
  text: string;
}

export interface CRMDeal {
  id: string;
  title: string;
  stage: CrmStage;
  value: number;
}

export interface CRMNote {
  id: string;
  note: string;
}

export interface QueueStatus {
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export interface WorkerLog {
  id: string;
  message: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}


