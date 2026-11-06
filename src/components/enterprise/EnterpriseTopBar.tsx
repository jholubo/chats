import React from 'react';
import {
  ShieldCheck,
  Users,
  Settings2,
  PhoneCall,
  Sparkles,
  UserCheck,
  Tag,
  BookOpen,
  PieChart,
  ChevronDown,
} from 'lucide-react';
import { Seller, DistributionConfig, UserProfile } from '../../types';

interface EnterpriseTopBarProps {
  currentUser: UserProfile;
  activeSeller: Seller;
  sellers: Seller[];
  distributionConfig: DistributionConfig;
  onSelectRoleSeller: (sellerId: string) => void;
  onOpenDistributionModal: () => void;
  onOpenContactsDrawer: () => void;
  onSimulateInboundChat: () => void;
  activeFilter: 'all' | 'mine' | 'new';
  onSelectFilter: (filter: 'all' | 'mine' | 'new') => void;
  unreadNewCount: number;
}

export const EnterpriseTopBar: React.FC<EnterpriseTopBarProps> = ({
  currentUser,
  activeSeller,
  sellers,
  distributionConfig,
  onSelectRoleSeller,
  onOpenDistributionModal,
  onOpenContactsDrawer,
  onSimulateInboundChat,
  activeFilter,
  onSelectFilter,
  unreadNewCount,
}) => {
  const isAdmin = activeSeller.role === 'admin';

  return (
    <div className="bg-[#111b21] border-b border-gray-800 text-gray-200 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 select-none">
      {/* Brand & Shared Number Badge */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-[#00a884] flex items-center justify-[#center] border border-emerald-500/30 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-gray-100 flex items-center gap-2">
              LuboChat <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800">INTERNO</span>
            </h1>
            <p className="text-[11px] text-gray-400">Herramienta Privada de Gestión de Vendedores</p>
          </div>
        </div>

        {/* WhatsApp Single Shared Number Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#202c33] border border-gray-700 rounded-lg text-xs font-mono text-emerald-400">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>+57 300 123 4567</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20">Único WhatsApp</span>
        </div>
      </div>

      {/* Center Filters & Quick Role Switcher */}
      <div className="flex items-center gap-2 flex-wrap justify-center w-full md:w-auto">
        {/* Chat List View Filters */}
        <div className="flex items-center bg-[#202c33] p-0.5 rounded-lg border border-gray-700/80 text-xs">
          <button
            onClick={() => onSelectFilter('all')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              activeFilter === 'all'
                ? 'bg-[#00a884] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Todos los Chats
          </button>
          <button
            onClick={() => onSelectFilter('mine')}
            className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeFilter === 'mine'
                ? 'bg-[#00a884] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Mis Asignados
          </button>
          <button
            onClick={() => onSelectFilter('new')}
            className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeFilter === 'new'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-300" />
            <span>Nuevos</span>
            {unreadNewCount > 0 && (
              <span className="bg-amber-400 text-amber-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {unreadNewCount}
              </span>
            )}
          </button>
        </div>

        {/* ACTIVE USER ROLE SWITCHER */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-[#202c33] hover:bg-[#2a3942] border border-gray-700 px-3 py-1 rounded-lg text-xs cursor-pointer transition-colors">
            <img
              src={activeSeller.avatar}
              alt={activeSeller.name}
              className="w-5 h-5 rounded-full object-cover border border-emerald-500"
            />
            <div className="text-left">
              <span className="font-semibold text-gray-200 block leading-tight">
                {activeSeller.name}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {activeSeller.role === 'admin' ? '👑 Admin General' : `👨‍💼 ${activeSeller.assignedPercentage}% Chats`}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
          </div>

          {/* Role Switch Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-64 bg-[#202c33] border border-gray-700 rounded-xl shadow-2xl py-2 hidden group-hover:block z-50">
            <div className="px-3 py-1 border-b border-gray-700 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Cambiar Rol / Vendedor Activo
            </div>
            {sellers.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectRoleSeller(s.id)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#2a3942] transition-colors ${
                  activeSeller.id === s.id ? 'bg-emerald-950/40 text-emerald-300 font-medium' : 'text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img src={s.avatar} className="w-6 h-6 rounded-full object-cover" alt={s.name} />
                  <div>
                    <div>{s.name}</div>
                    <div className="text-[10px] text-gray-400">
                      {s.role === 'admin' ? 'Administrador' : `Asignación: ${s.assignedPercentage}% (${s.quotaOutOfTen}/10 chats)`}
                    </div>
                  </div>
                </div>
                {s.role === 'admin' && <span className="text-amber-400 text-xs">👑</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Enterprise Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Contacts Manager Button */}
        <button
          onClick={onOpenContactsDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] border border-gray-700 text-gray-200 text-xs rounded-lg transition-colors"
          title="Gestor de Contactos e Historial Empresarial"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Contactos</span>
        </button>

        {/* Simulate Inbound Chat Test Button */}
        <button
          onClick={onSimulateInboundChat}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg transition-colors font-medium"
          title="Simular llegada de un mensaje de cliente nuevo (Genera CHAT NUEVO y aplica regla)"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>+ Simular Chat Nuevo</span>
        </button>

        {/* Admin Rules & Distribution Configuration Button */}
        {isAdmin && (
          <button
            onClick={onOpenDistributionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-lg transition-colors"
            title="Configurar Distribución de Vendedores y Reglas"
          >
            <Settings2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Asignación Vendedores</span>
          </button>
        )}
      </div>
    </div>
  );
};
