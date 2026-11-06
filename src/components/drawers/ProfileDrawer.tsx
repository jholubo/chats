import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { ArrowLeft, Camera, Check, Edit2 } from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  id?: string;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  id,
}) => {
  const [name, setName] = useState(user.name);
  const [about, setAbout] = useState(user.about);
  const [editingName, setEditingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = () => {
    onUpdateUser({ name });
    setEditingName(false);
  };

  const handleSaveAbout = () => {
    onUpdateUser({ about });
    setEditingAbout(false);
  };

  return (
    <div
      id={id}
      className="absolute inset-y-0 left-0 z-40 w-full sm:w-96 bg-[#f0f2f5] dark:bg-[#111b21] flex flex-col shadow-2xl transition-transform duration-300"
    >
      {/* Header */}
      <div className="flex items-end h-28 p-4 bg-[#008069] dark:bg-[#202c33] text-white gap-6">
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/10 rounded-full transition-colors mb-0.5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-semibold mb-0.5">Perfil de Agente</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative group cursor-pointer">
            <Avatar src={user.avatar} alt={user.name} size="xl" />
            <div
              onClick={() => alert('Seleccionar nueva foto de perfil de WhatsApp')}
              className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] text-center font-medium uppercase px-2">
                Cambiar foto
              </span>
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-xl shadow-sm space-y-2">
          <label className="text-xs font-semibold text-[#00a884]">Tu nombre</label>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-[#00a884] focus:outline-none py-1"
              />
              <button onClick={handleSaveName} className="p-1 text-[#00a884]">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900 dark:text-gray-100">{user.name}</span>
              <button onClick={() => setEditingName(true)} className="p-1 text-gray-400 hover:text-gray-600">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-[11px] text-gray-400">
            Este nombre será visible para tus contactos y clientes en LuboChat.
          </p>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-xl shadow-sm space-y-2">
          <label className="text-xs font-semibold text-[#00a884]">Info. / Estado</label>
          {editingAbout ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full text-xs text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-[#00a884] focus:outline-none py-1"
              />
              <button onClick={handleSaveAbout} className="p-1 text-[#00a884]">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900 dark:text-gray-100">{user.about}</span>
              <button onClick={() => setEditingAbout(true)} className="p-1 text-gray-400 hover:text-gray-600">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Phone Info */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-xl shadow-sm space-y-1">
          <label className="text-xs font-semibold text-gray-400">Número de teléfono</label>
          <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{user.phoneNumber}</p>
        </div>
      </div>
    </div>
  );
};
