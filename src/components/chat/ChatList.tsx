import React, { useState } from 'react';
import { Conversation, ChatFilterTab } from '../../types';
import { ChatItem } from './ChatItem';
import { Search, UserCheck, Tag, Inbox, Archive } from 'lucide-react';

interface ChatListProps {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
  onToggleMute: (chatId: string) => void;
  onMarkUnread: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  activeFilterTab?: ChatFilterTab;
  onSelectFilterTab?: (tab: ChatFilterTab) => void;
  unreadNewCount?: number;
  unassignedCount?: number;
  myChatsCount?: number;
  closedCount?: number;
  onTransferChat?: (chatId: string) => void;
  id?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  activeChatId,
  onSelectChat,
  onTogglePin,
  onToggleMute,
  onMarkUnread,
  onDeleteChat,
  onOpenNewChat,
  activeFilterTab = 'all',
  onSelectFilterTab,
  unreadNewCount = 0,
  unassignedCount = 0,
  myChatsCount = 0,
  closedCount = 0,
  onTransferChat,
  id,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const nameMatch = (conv.groupName || conv.contact.name)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const phoneMatch = conv.contact.phoneNumber.includes(searchQuery);

    if (!nameMatch && !phoneMatch) return false;
    return true;
  });

  return (
    <div id={id} className="flex flex-col h-full bg-white dark:bg-[#111b21] select-none">
      {/* Search and Category Filters */}
      <div className="p-2 space-y-2 border-b border-gray-100 dark:border-gray-800">
        <div className="relative flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
          <input
            id="chat-search-input"
            type="text"
            placeholder="Buscar un chat o iniciar uno nuevo"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* 5 Filter Pills (Requirement 1 & 2) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
          <button
            id="filter-all"
            onClick={() => onSelectFilterTab?.('all')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeFilterTab === 'all'
                ? 'bg-[#00a884]/20 text-[#00a884] dark:bg-[#00a884]/30 dark:text-[#00a884] font-semibold'
                : 'bg-[#f0f2f5] dark:bg-[#202c33] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Todos
          </button>

          <button
            id="filter-mine"
            onClick={() => onSelectFilterTab?.('mine')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeFilterTab === 'mine'
                ? 'bg-[#00a884]/20 text-[#00a884] dark:bg-[#00a884]/30 dark:text-[#00a884] font-semibold'
                : 'bg-[#f0f2f5] dark:bg-[#202c33] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Mis chats</span>
            {myChatsCount > 0 && (
              <span className="text-[10px] opacity-75">({myChatsCount})</span>
            )}
          </button>

          <button
            id="filter-new"
            onClick={() => onSelectFilterTab?.('new')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeFilterTab === 'new'
                ? 'bg-red-500/20 text-red-400 dark:bg-red-500/30 dark:text-red-300 font-bold border border-red-500/30'
                : 'bg-[#f0f2f5] dark:bg-[#202c33] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Tag className="w-3 h-3 text-red-400" />
            <span>Chats nuevos</span>
            {unreadNewCount > 0 && (
              <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse shadow-sm">
                {unreadNewCount}
              </span>
            )}
          </button>

          <button
            id="filter-unassigned"
            onClick={() => onSelectFilterTab?.('unassigned')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeFilterTab === 'unassigned'
                ? 'bg-amber-500/20 text-amber-400 dark:bg-amber-500/30 dark:text-amber-300 font-semibold'
                : 'bg-[#f0f2f5] dark:bg-[#202c33] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Inbox className="w-3 h-3" />
            <span>Sin asignar</span>
            {unassignedCount > 0 && (
              <span className="text-[10px] opacity-75">({unassignedCount})</span>
            )}
          </button>

          <button
            id="filter-closed"
            onClick={() => onSelectFilterTab?.('closed')}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeFilterTab === 'closed'
                ? 'bg-gray-500/20 text-gray-400 dark:bg-gray-500/30 dark:text-gray-300 font-semibold'
                : 'bg-[#f0f2f5] dark:bg-[#202c33] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Archive className="w-3 h-3" />
            <span>Cerrados</span>
          </button>
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <p className="text-sm font-medium">No hay chats en esta categoría</p>
            <p className="text-xs text-gray-500 mt-1">Filtro activo: {activeFilterTab}</p>
            <button
              onClick={onOpenNewChat}
              className="mt-4 px-4 py-2 text-xs font-medium text-[#00a884] border border-[#00a884] rounded-lg hover:bg-[#00a884]/10 transition-colors"
            >
              Iniciar un nuevo chat
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ChatItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeChatId}
              onSelect={() => onSelectChat(conv.id)}
              onTogglePin={() => onTogglePin(conv.id)}
              onToggleMute={() => onToggleMute(conv.id)}
              onMarkUnread={() => onMarkUnread(conv.id)}
              onDeleteChat={() => onDeleteChat(conv.id)}
              onTransferChat={() => onTransferChat?.(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
