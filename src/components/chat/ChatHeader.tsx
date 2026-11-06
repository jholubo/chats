import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  Lock,
  UserPlus,
  Archive,
  UserCheck,
  Tag,
  Eye,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Conversation, Seller, ConversationStatus } from '../../types';
import { Avatar } from '../common/Avatar';
import { DropdownMenu, DropdownItem } from '../common/DropdownMenu';

interface ChatHeaderProps {
  conversation: Conversation;
  activeSeller: Seller;
  sellers?: Seller[];
  onReassignSeller?: (sellerId: string) => void;
  onAdminTakeover?: () => void;
  onChangeStatus?: (status: ConversationStatus) => void;
  onLockChat?: () => void;
  onUnlockChat?: () => void;
  onToggleInfoDrawer: () => void;
  onSearchInChat: () => void;
  onOpenTransferModal?: () => void;
  onOpenCloseModal?: () => void;
  id?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  activeSeller,
  sellers = [],
  onReassignSeller,
  onAdminTakeover,
  onChangeStatus,
  onLockChat,
  onUnlockChat,
  onToggleInfoDrawer,
  onSearchInChat,
  onOpenTransferModal,
  onOpenCloseModal,
  id,
}) => {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [reassignSubmenuOpen, setReassignSubmenuOpen] = useState(false);
  const [statusSubmenuOpen, setStatusSubmenuOpen] = useState(false);

  const { contact, isGroup, groupName, groupAvatar } = conversation;
  const displayName = isGroup ? groupName : contact.name;
  const avatarSrc = isGroup ? groupAvatar : contact.avatar;

  const isLockedByOther =
    conversation.lockedBySellerId && conversation.lockedBySellerId !== activeSeller.id;
  const isLockedByMe = conversation.lockedBySellerId === activeSeller.id;

  const activeViewers = conversation.activeViewers || [];
  const otherViewers = activeViewers.filter((v) => v.sellerId !== activeSeller.id);

  const activeTyping = conversation.activeTyping || [];
  const otherTyping = activeTyping.filter((t) => t.sellerId !== activeSeller.id);

  const statusLabels: Record<ConversationStatus, string> = {
    NEW: 'Nuevo',
    ASSIGNED: 'Asignado',
    IN_PROGRESS: 'En atención',
    WAITING_CUSTOMER: 'Esperando cliente',
    CLOSED: 'Cerrado',
    CLOSED_WON: 'Ganado 🎉',
    CLOSED_LOST: 'Perdido ❌',
  };

  const currentStatus = conversation.status || 'NEW';

  const menuItems: DropdownItem[] = [
    {
      id: 'info',
      label: 'Info del contacto',
      icon: <Info className="w-4 h-4 text-blue-400" />,
      onClick: onToggleInfoDrawer,
    },
    ...(onOpenTransferModal
      ? [
          {
            id: 'transfer',
            label: 'Transferir conversación',
            icon: <UserPlus className="w-4 h-4 text-[#00a884]" />,
            onClick: onOpenTransferModal,
          },
        ]
      : []),
    {
      id: 'lock',
      label: isLockedByMe ? 'Desbloquear chat' : 'Bloquear chat (uso exclusivo)',
      icon: <Lock className="w-4 h-4 text-amber-400" />,
      onClick: () => (isLockedByMe ? onUnlockChat?.() : onLockChat?.()),
    },
    {
      id: 'status_menu',
      label: `Estado: ${statusLabels[currentStatus]}`,
      icon: <Tag className="w-4 h-4 text-purple-400" />,
      onClick: () => {
        setStatusSubmenuOpen(!statusSubmenuOpen);
        setReassignSubmenuOpen(false);
      },
    },
    ...(activeSeller.role === 'admin' && onReassignSeller && sellers.length > 0
      ? [
          {
            id: 'reassign_menu',
            label: `Reasignar (${conversation.assignedSellerName || 'Sin asignar'})`,
            icon: <UserCheck className="w-4 h-4 text-emerald-400" />,
            onClick: () => {
              setReassignSubmenuOpen(!reassignSubmenuOpen);
              setStatusSubmenuOpen(false);
            },
          },
        ]
      : []),
    ...(onOpenCloseModal
      ? [
          {
            id: 'close_chat',
            label: 'Cerrar conversación',
            icon: <Archive className="w-4 h-4 text-amber-400" />,
            onClick: onOpenCloseModal,
          },
        ]
      : []),
  ];

  return (
    <div
      id={id}
      className="flex items-center justify-between px-4 py-2 bg-[#202c33] border-b border-gray-800 z-10 select-none min-h-[59px]"
    >
      {/* Contact Info Header */}
      <div
        onClick={onToggleInfoDrawer}
        className="flex items-center gap-3 cursor-pointer min-w-0"
      >
        <Avatar
          src={avatarSrc}
          alt={displayName}
          isOnline={contact.isOnline}
          size="md"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-100 truncate">
              {displayName}
            </h2>

            {/* Subtle lock icon if locked */}
            {isLockedByOther && (
              <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-800 font-medium flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-red-400" />
                {conversation.lockedBySellerName}
              </span>
            )}
          </div>

          <div className="text-[11px] text-gray-400 truncate flex items-center gap-2 mt-0.5">
            {contact.isTyping ? (
              <span className="text-[#00a884] font-medium animate-pulse">escribiendo...</span>
            ) : otherTyping.length > 0 ? (
              <span className="text-[#00a884] font-medium animate-pulse">
                {otherTyping.map((t) => t.sellerName.split(' ')[0]).join(', ')} escribiendo...
              </span>
            ) : (
              <span>{contact.phoneNumber}</span>
            )}

            {otherViewers.length > 0 && (
              <span className="text-[10px] text-blue-400 flex items-center gap-1">
                <Eye className="w-2.5 h-2.5" />
                {otherViewers.map((v) => v.sellerName.split(' ')[0]).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Right Controls - Search & Single Options Menu Button */}
      <div className="flex items-center gap-1 relative flex-shrink-0">
        <button
          onClick={onSearchInChat}
          className="p-2 text-gray-300 hover:bg-gray-700/60 rounded-full transition-colors"
          title="Buscar en el chat"
        >
          <Search className="w-5 h-5 text-gray-300" />
        </button>

        {/* Single "Opciones" Dropdown Menu Button */}
        <button
          id="btn-header-options"
          onClick={() => {
            setOptionsOpen(!optionsOpen);
            setReassignSubmenuOpen(false);
            setStatusSubmenuOpen(false);
          }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 hover:bg-gray-700/60 rounded-lg transition-colors font-medium"
          title="Opciones del chat"
        >
          <span>Opciones</span>
          <MoreVertical className="w-4 h-4 text-gray-300" />
        </button>

        {/* Main Options Menu */}
        <DropdownMenu
          isOpen={optionsOpen}
          onClose={() => {
            setOptionsOpen(false);
            setReassignSubmenuOpen(false);
            setStatusSubmenuOpen(false);
          }}
          items={menuItems}
          position="bottom-right"
        />

        {/* Submenu for Status Selector */}
        {optionsOpen && statusSubmenuOpen && (
          <div className="absolute right-48 top-10 w-44 bg-[#202c33] border border-gray-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
            <div className="px-3 py-1 text-[10px] text-gray-400 font-semibold border-b border-gray-700">
              Cambiar Estado:
            </div>
            {(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'CLOSED'] as ConversationStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => {
                  onChangeStatus?.(st);
                  setStatusSubmenuOpen(false);
                  setOptionsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#2a3942] transition-colors ${
                  currentStatus === st ? 'text-emerald-400 font-semibold' : 'text-gray-200'
                }`}
              >
                {statusLabels[st]}
              </button>
            ))}
          </div>
        )}

        {/* Submenu for Admin Seller Reassignment */}
        {optionsOpen && reassignSubmenuOpen && (
          <div className="absolute right-48 top-16 w-52 bg-[#202c33] border border-gray-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
            <div className="px-3 py-1 text-[10px] text-gray-400 font-semibold border-b border-gray-700">
              Reasignar a Vendedor:
            </div>
            {sellers.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onReassignSeller?.(s.id);
                  setReassignSubmenuOpen(false);
                  setOptionsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#2a3942] transition-colors flex items-center gap-2 ${
                  conversation.assignedSellerId === s.id ? 'text-emerald-400 font-semibold' : 'text-gray-200'
                }`}
              >
                <img src={s.avatar} className="w-4 h-4 rounded-full object-cover" alt={s.name} />
                <span className="truncate">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
