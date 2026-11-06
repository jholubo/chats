import React, { useState } from 'react';
import { Conversation, Contact } from '../../types';
import { ArrowLeft, Search, Users, UserPlus } from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface NewChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectContact: (contact: Contact) => void;
  id?: string;
}

export const NewChatDrawer: React.FC<NewChatDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  onSelectContact,
  id,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const contactsList = conversations.map((c) => c.contact);
  const filtered = contactsList.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.phoneNumber.includes(query)
  );

  return (
    <div
      id={id}
      className="absolute inset-y-0 left-0 z-40 w-full sm:w-96 bg-[#f0f2f5] dark:bg-[#111b21] flex flex-col shadow-2xl transition-transform duration-300"
    >
      {/* Header */}
      <div className="flex items-end h-28 p-4 bg-[#008069] dark:bg-[#202c33] text-white gap-6">
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors mb-0.5">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-semibold mb-0.5">Nuevo Chat</h2>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111b21]">
        <div className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar nombre o teléfono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Action items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div
          onClick={() => alert('Creando nuevo grupo en LuboChat')}
          className="flex items-center gap-3 p-3 bg-white dark:bg-[#202c33] hover:bg-gray-100 dark:hover:bg-[#182229] rounded-xl cursor-pointer"
        >
          <div className="p-2.5 bg-[#00a884] text-white rounded-full">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            Nuevo grupo
          </span>
        </div>

        <div
          onClick={() => alert('Añadir nuevo contacto a la agenda')}
          className="flex items-center gap-3 p-3 bg-white dark:bg-[#202c33] hover:bg-gray-100 dark:hover:bg-[#182229] rounded-xl cursor-pointer"
        >
          <div className="p-2.5 bg-[#00a884] text-white rounded-full">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            Nuevo contacto
          </span>
        </div>

        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-3">
          Contactos Frecuentes
        </h4>

        {filtered.map((contact) => (
          <div
            key={contact.id}
            onClick={() => {
              onSelectContact(contact);
              onClose();
            }}
            className="flex items-center gap-3 p-3 bg-white dark:bg-[#202c33] hover:bg-gray-100 dark:hover:bg-[#182229] rounded-xl cursor-pointer transition-colors"
          >
            <Avatar src={contact.avatar} alt={contact.name} size="md" isOnline={contact.isOnline} />
            <div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">{contact.name}</h3>
              <p className="text-[11px] text-gray-400">{contact.about || contact.phoneNumber}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
