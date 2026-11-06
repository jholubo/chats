import React, { useState } from 'react';
import {
  X,
  Users,
  PieChart,
  Percent,
  CheckCircle2,
  Tag,
  UserPlus,
  Trash2,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Award,
} from 'lucide-react';
import { DistributionConfig, Seller, DistributionMode } from '../../types';

interface DistributionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: DistributionConfig;
  onSaveConfig: (newConfig: DistributionConfig) => void;
  onSimulateInbound: () => void;
}

export const DistributionDrawer: React.FC<DistributionDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSimulateInbound,
}) => {
  const [mode, setMode] = useState<DistributionMode>(config.mode);
  const [totalQuota, setTotalQuota] = useState<number>(config.totalQuota || 10);
  const [autoTagNewChat, setAutoTagNewChat] = useState<boolean>(config.autoTagNewChat);
  const [autoAssignOnReply, setAutoAssignOnReply] = useState<boolean>(config.autoAssignOnReply);
  const [sellers, setSellers] = useState<Seller[]>(config.sellers);

  // New Seller Modal state
  const [showAddSeller, setShowAddSeller] = useState(false);
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerEmail, setNewSellerEmail] = useState('');
  const [newSellerPercentage, setNewSellerPercentage] = useState(20);
  const [newSellerQuota, setNewSellerQuota] = useState(2);

  if (!isOpen) return null;

  const handlePercentageChange = (sellerId: string, percentage: number) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, assignedPercentage: Math.max(0, Math.min(100, percentage)) } : s))
    );
  };

  const handleQuotaChange = (sellerId: string, quota: number) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, quotaOutOfTen: Math.max(0, Math.min(totalQuota, quota)) } : s))
    );
  };

  const handleToggleActive = (sellerId: string) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleAddSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerName.trim()) return;

    const newSeller: Seller = {
      id: `seller_${Date.now()}`,
      name: newSellerName,
      email: newSellerEmail || `${newSellerName.toLowerCase().replace(/\s+/g, '.')}@miempresa.com`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
      role: 'vendedor',
      status: 'online',
      assignedPercentage: newSellerPercentage,
      quotaOutOfTen: newSellerQuota,
      assignedChatsCount: 0,
      isActive: true,
    };

    setSellers([...sellers, newSeller]);
    setNewSellerName('');
    setNewSellerEmail('');
    setShowAddSeller(false);
  };

  const handleDeleteSeller = (sellerId: string) => {
    setSellers((prev) => prev.filter((s) => s.id !== sellerId));
  };

  const totalPercentage = sellers
    .filter((s) => s.role === 'vendedor' && s.isActive)
    .reduce((acc, s) => acc + s.assignedPercentage, 0);

  const totalQuotasSum = sellers
    .filter((s) => s.role === 'vendedor' && s.isActive)
    .reduce((acc, s) => acc + s.quotaOutOfTen, 0);

  const handleSave = () => {
    onSaveConfig({
      mode,
      totalQuota,
      autoTagNewChat,
      autoAssignOnReply,
      sellers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#111b21] border border-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#202c33] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-100">
                Sistema Inteligente de Asignación de Chats
              </h2>
              <p className="text-xs text-gray-400">
                Distribución equitativa y reglas de equipo para el WhatsApp único de la empresa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1 text-xs">
          
          {/* 1. DISTRIBUTION MODE SELECTION */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Modo de Distribución Automática
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Option 1: Percentages */}
              <button
                onClick={() => setMode('percentage')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === 'percentage'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md'
                    : 'bg-[#202c33] border-gray-700 hover:border-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-400" />
                    Porcentajes de Distribución (%)
                  </span>
                  {mode === 'percentage' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Asigna chats ponderados por porcentaje definido (Ej: Vendedor A 50%, Vendedor B 30%, Vendedor C 20%).
                </p>
              </button>

              {/* Option 2: Quotas out of 10 */}
              <button
                onClick={() => setMode('quota_round_robin')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === 'quota_round_robin'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md'
                    : 'bg-[#202c33] border-gray-700 hover:border-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Regla de Cuotas (X de cada 10 chats)
                  </span>
                  {mode === 'quota_round_robin' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Asigna X de cada 10 conversaciones consecutivas a cada vendedor en rotación secuencial.
                </p>
              </button>
            </div>
          </div>

          {/* 2. AUTOMATIC RULES CONFIGURATION */}
          <div className="bg-[#182229] border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-gray-200 flex items-center gap-2 border-b border-gray-800 pb-2">
              <Tag className="w-4 h-4 text-amber-400" />
              Reglas Automáticas de Etiquetado y Reclamación
            </div>
            
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="font-medium text-gray-200">Etiquetado Automático Inbound ("CHAT NUEVO")</div>
                <div className="text-[11px] text-gray-400">Agrega automáticamente la etiqueta "CHAT NUEVO" cuando entra un mensaje no registrado.</div>
              </div>
              <input
                type="checkbox"
                checked={autoTagNewChat}
                onChange={(e) => setAutoTagNewChat(e.target.checked)}
                className="w-4 h-4 accent-[#00a884] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-gray-800/60 pt-2">
              <div>
                <div className="font-medium text-gray-200">Asignación Automática al Responder</div>
                <div className="text-[11px] text-gray-400">Cuando un vendedor responde a un chat no asignado o nuevo, la conversación se asigna inmediatamente a ese vendedor.</div>
              </div>
              <input
                type="checkbox"
                checked={autoAssignOnReply}
                onChange={(e) => setAutoAssignOnReply(e.target.checked)}
                className="w-4 h-4 accent-[#00a884] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* 3. SELLERS & DISTRIBUTION SLIDERS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Equipo de Vendedores ({sellers.filter(s => s.role === 'vendedor').length})
                </h3>
                <p className="text-[11px] text-gray-400">
                  {mode === 'percentage'
                    ? `Suma actual de porcentajes: ${totalPercentage}% ${totalPercentage !== 100 ? '(Recomendado: 100%)' : '✅ Correcto'}`
                    : `Suma de cuotas: ${totalQuotasSum} de ${totalQuota} chats`}
                </p>
              </div>
              <button
                onClick={() => setShowAddSeller(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium text-xs shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Agregar Vendedor</span>
              </button>
            </div>

            {/* Add Seller Form */}
            {showAddSeller && (
              <form onSubmit={handleAddSellerSubmit} className="bg-[#202c33] p-4 rounded-xl border border-gray-700 space-y-3">
                <div className="text-xs font-semibold text-emerald-400">Nuevo Vendedor</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Daniel Silva"
                      value={newSellerName}
                      onChange={(e) => setNewSellerName(e.target.value)}
                      className="w-full bg-[#111b21] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="daniel@miempresa.com"
                      value={newSellerEmail}
                      onChange={(e) => setNewSellerEmail(e.target.value)}
                      className="w-full bg-[#111b21] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Porcentaje de Asignación (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newSellerPercentage}
                      onChange={(e) => setNewSellerPercentage(Number(e.target.value))}
                      className="w-full bg-[#111b21] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Cuota (X de cada 10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={newSellerQuota}
                      onChange={(e) => setNewSellerQuota(Number(e.target.value))}
                      className="w-full bg-[#111b21] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSeller(false)}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg"
                  >
                    Guardar Vendedor
                  </button>
                </div>
              </form>
            )}

            {/* Seller Rows */}
            <div className="space-y-3">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    seller.isActive
                      ? 'bg-[#202c33] border-gray-700'
                      : 'bg-[#182229]/50 border-gray-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="w-8 h-8 rounded-full object-cover border border-emerald-500/50"
                      />
                      <div>
                        <div className="font-semibold text-gray-200 flex items-center gap-2">
                          {seller.name}
                          {seller.role === 'admin' && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 font-normal">
                              👑 Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {seller.email} • {seller.assignedChatsCount} chats atendidos
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleActive(seller.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          seller.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {seller.isActive ? 'Activo' : 'Inactivo'}
                      </button>

                      {seller.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteSeller(seller.id)}
                          className="p-1 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded transition-colors"
                          title="Eliminar vendedor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slider or Quota Input for Vendedor */}
                  {seller.role === 'vendedor' && seller.isActive && (
                    <div className="mt-3 pt-3 border-t border-gray-700/60 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {mode === 'percentage' ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-300 font-medium">Porcentaje asignado:</span>
                            <span className="text-emerald-400 font-bold">{seller.assignedPercentage}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={seller.assignedPercentage}
                            onChange={(e) => handlePercentageChange(seller.id, Number(e.target.value))}
                            className="w-full accent-[#00a884] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-[#111b21] p-2 rounded-lg border border-gray-700">
                          <span className="text-[11px] text-gray-300 font-medium">Cuota consecutiva:</span>
                          <div className="flex items-center gap-1 font-bold text-amber-300">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={seller.quotaOutOfTen}
                              onChange={(e) => handleQuotaChange(seller.id, Number(e.target.value))}
                              className="w-12 bg-[#202c33] border border-gray-600 rounded px-1.5 py-0.5 text-center text-white text-xs"
                            />
                            <span>de 10 chats</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#202c33] border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={onSimulateInbound}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl transition-colors font-medium"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Probar Simulación Chat Entrante</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#00a884] hover:bg-emerald-600 text-white text-xs rounded-xl font-semibold shadow-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Reglas y Porcentajes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
