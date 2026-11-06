import React, { useState } from 'react';
import { UserProfile, Seller } from '../../types';
import { Avatar } from '../common/Avatar';
import { CircleFadingPlus, MessageSquarePlus, Settings, MoreVertical, Sparkles, UserCheck, BookOpen, ChevronDown, Zap } from 'lucide-react';
import { DropdownMenu, DropdownItem } from '../common/DropdownMenu';

interface SidebarHeaderProps {
  user: UserProfile;
  activeSeller?: Seller;
  sellers?: Seller[];
  onSelectRoleSeller?: (sellerId: string) => void;
  onOpenDistributionModal?: () => void;
  onOpenContactsDrawer?: () => void;
  onOpenQuickResponsesModal?: () => void;
  onSimulateInboundChat?: () => void;
  onOpenProfile: () => void;
  onOpenStatus: () => void;
  onOpenNewChat: () => void;
  onOpenSettings: () => void;
  wabaMode: 'simulation' | 'cloud_api';
  id?: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  user,
  activeSeller,
  sellers = [],
  onSelectRoleSeller,
  onOpenDistributionModal,
  onOpenContactsDrawer,
  onOpenQuickResponsesModal,
  onSimulateInboundChat,
  onOpenProfile,
  onOpenStatus,
  onOpenNewChat,
  onOpenSettings,
  wabaMode,
  id,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sellerMenuOpen, setSellerMenuOpen] = useState(false);

  const currentSellerName = activeSeller ? activeSeller.name : user.name;
  const currentSellerAvatar = activeSeller ? activeSeller.avatar : user.avatar;

  const menuItems: DropdownItem[] = [
    {
      id: 'simulate',
      label: '+ Simular Chat Nuevo',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      onClick: () => onSimulateInboundChat?.(),
    },
    {
      id: 'quick_responses',
      label: 'Respuestas Rápidas',
      icon: <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />,
      onClick: () => onOpenQuickResponsesModal?.(),
    },
    {
      id: 'distribution',
      label: 'Asignación de Vendedores',
      icon: <UserCheck className="w-4 h-4 text-amber-400" />,
      onClick: () => onOpenDistributionModal?.(),
    },
    {
      id: 'contacts',
      label: 'Directorio de Contactos',
      icon: <BookOpen className="w-4 h-4 text-blue-400" />,
      onClick: () => onOpenContactsDrawer?.(),
    },
    {
      id: 'profile',
      label: 'Perfil',
      onClick: onOpenProfile,
    },
    {
      id: 'status',
      label: 'Estados / Historias',
      onClick: onOpenStatus,
    },
    {
      id: 'settings',
      label: 'Configuración API',
      onClick: onOpenSettings,
    },
  ];

  return (
    <div
      id={id}
      className="flex items-center justify-between px-3.5 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800 select-none"
    >
      {/* Current Active Seller / Agent Avatar & Dropdown Selector */}
      <div className="relative">
        <div
          onClick={() => sellers.length > 0 && setSellerMenuOpen(!sellerMenuOpen)}
          className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <Avatar
            src={currentSellerAvatar}
            alt={currentSellerName}
            size="md"
          />
          <div>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
              <span>{currentSellerName}</span>
              {sellers.length > 0 && <ChevronDown className="w-3 h-3 text-gray-400" />}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">
              {activeSeller?.role === 'admin' ? 'Administrador' : 'Vendedor'}
            </span>
          </div>
        </div>

        {/* Quick Seller Switch Popover */}
        {sellerMenuOpen && (
          <div className="absolute left-0 top-full mt-2 w-56 bg-[#202c33] border border-gray-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
            <div className="px-3 py-1 text-[10px] text-gray-400 font-semibold border-b border-gray-700">
              Cambiar Vendedor Activo:
            </div>
            {sellers.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSelectRoleSeller?.(s.id);
                  setSellerMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#2a3942] transition-colors ${
                  activeSeller?.id === s.id ? 'text-emerald-400 font-semibold bg-emerald-950/30' : 'text-gray-200'
                }`}
              >
                <img src={s.avatar} className="w-5 h-5 rounded-full object-cover" alt={s.name} />
                <span className="truncate">{s.name}</span>
                {s.role === 'admin' && <span className="ml-auto text-[10px] text-amber-400">Admin</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 relative">
        <button
          id="btn-sidebar-status"
          title="Estados"
          onClick={onOpenStatus}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-full transition-colors"
        >
          <CircleFadingPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </button>

        <button
          id="btn-sidebar-new-chat"
          title="Nuevo chat"
          onClick={onOpenNewChat}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-full transition-colors"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>

        <button
          id="btn-sidebar-menu"
          title="Opciones"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-full transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        <DropdownMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          items={menuItems}
          position="bottom-right"
        />
      </div>
    </div>
  );
};

