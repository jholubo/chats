import React, { useState } from 'react';
import { Conversation, Seller } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { DropdownMenu, DropdownItem } from '../common/DropdownMenu';
import { WhatsAppMessageService } from '../../services/whatsapp/message.service';
import { Pin, VolumeX, ChevronDown, Check, CheckCheck, Bell, UserPlus } from 'lucide-react';

interface ChatItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin?: () => void;
  onToggleMute?: () => void;
  onMarkUnread?: () => void;
  onDeleteChat?: () => void;
  onTransferChat?: () => void;
  id?: string;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onTogglePin,
  onToggleMute,
  onMarkUnread,
  onDeleteChat,
  onTransferChat,
  id,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { contact, lastMessage, unreadCount, isPinned, isMuted, isGroup, groupName, groupAvatar } = conversation;
  const displayName = isGroup ? groupName : contact.name;
  const avatarSrc = isGroup ? groupAvatar || contact.avatar : contact.avatar;

  const hasActiveReminder = conversation.reminders?.some((r) => !r.isCompleted);

  const dropdownItems: DropdownItem[] = [
    {
      id: 'transfer',
      label: 'Transferir conversación',
      icon: <UserPlus className="w-4 h-4 text-emerald-400" />,
      onClick: () => onTransferChat?.(),
    },
    {
      id: 'pin',
      label: isPinned ? 'Desanclar chat' : 'Anclar chat',
      icon: <Pin className="w-4 h-4" />,
      onClick: () => onTogglePin?.(),
    },
    {
      id: 'mute',
      label: isMuted ? 'Desactivar silencio' : 'Silenciar notificaciones',
      icon: <VolumeX className="w-4 h-4" />,
      onClick: () => onToggleMute?.(),
    },
    {
      id: 'unread',
      label: 'Marcar como no leído',
      onClick: () => onMarkUnread?.(),
    },
    {
      id: 'delete',
      label: 'Eliminar chat',
      danger: true,
      onClick: () => onDeleteChat?.(),
    },
  ];

  const renderLastMessageSummary = () => {
    if (contact.isTyping) {
      return <span className="text-[#00a884] dark:text-[#00a884] text-[11px] font-medium animate-pulse">escribiendo...</span>;
    }
    if (!lastMessage) return <span className="text-gray-400 dark:text-gray-500 text-[11px]">Sin mensajes</span>;

    const statusInfo = lastMessage.fromMe ? WhatsAppMessageService.getStatusIconInfo(lastMessage.status) : null;

    return (
      <div className="flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-gray-500 dark:text-gray-400">
        {lastMessage.fromMe && (
          <span className={`flex-shrink-0 ${statusInfo?.color}`}>
            {lastMessage.status === 'read' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
            ) : lastMessage.status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Check className="w-3.5 h-3.5 text-gray-400" />
            )}
          </span>
        )}
        <span className="truncate">
          {lastMessage.type === 'audio' ? '🎤 Nota de voz' :
           lastMessage.type === 'image' ? '📷 Foto' :
           lastMessage.type === 'document' ? '📄 Documento' :
           lastMessage.type === 'location' ? '📍 Ubicación' :
           lastMessage.type === 'system' ? `💬 ${lastMessage.content}` :
           lastMessage.content}
        </span>
      </div>
    );
  };

  return (
    <div
      id={id}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-800/60 transition-colors ${
        isActive
          ? 'bg-[#f0f2f5] dark:bg-[#2a3942]'
          : 'hover:bg-[#f5f6f8] dark:hover:bg-[#202c33] bg-white dark:bg-[#111b21]'
      }`}
    >
      <Avatar
        src={avatarSrc}
        alt={displayName || ''}
        size="md"
        isOnline={contact.isOnline}
      />

      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-normal text-sm text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
            <span>{displayName}</span>
            {hasActiveReminder && (
              <span title="Recordatorio activo" className="text-amber-400 animate-pulse">
                <Bell className="w-3.5 h-3.5 fill-amber-400" />
              </span>
            )}
          </span>
          <span className={`text-xs flex-shrink-0 ${unreadCount > 0 ? 'text-[#00a884] font-medium' : 'text-gray-400'}`}>
            {conversation.updatedAt}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            {renderLastMessageSummary()}

            {/* Tags, CRM stage & Seller Badge */}
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {(conversation.isNewChat || conversation.labels.includes('CHAT NUEVO') || conversation.status === 'NEW') && (
                <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/30 font-bold uppercase tracking-tight">
                  CHAT NUEVO
                </span>
              )}
              {conversation.crmStage && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${
                  conversation.crmStage === 'Ganado' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  conversation.crmStage === 'Perdido' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  conversation.crmStage === 'Cotización' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  conversation.crmStage === 'Negociación' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                  'bg-gray-700/50 text-gray-300 border-gray-600'
                }`}>
                  {conversation.crmStage}
                </span>
              )}
              {conversation.assignedSellerName && (
                <span className="text-[9px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800/80 truncate max-w-[110px]">
                  {conversation.assignedSellerName.split(' ')[0]}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {isMuted && <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
            {isPinned && <Pin className="w-3.5 h-3.5 text-gray-400 transform rotate-45" />}
            {unreadCount > 0 && <Badge count={unreadCount} variant="emerald" />}

            {(isHovered || menuOpen) && (
              <button
                id={`chat-item-menu-${conversation.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <DropdownMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={dropdownItems}
        position="bottom-right"
      />
    </div>
  );
};
