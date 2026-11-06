import React, { useState } from 'react';
import { Seller, TransferPayload } from '../../types';
import { UserPlus, X, AlertCircle, FileText } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  contactName: string;
  currentSellerName?: string;
  sellers: Seller[];
  onConfirmTransfer: (payload: TransferPayload) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  chatId,
  contactName,
  currentSellerName,
  sellers,
  onConfirmTransfer,
}) => {
  const [targetSellerId, setTargetSellerId] = useState('');
  const [reason, setReason] = useState('Cotización de Servicio');
  const [contextNote, setContextNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSellerId) {
      setError('Debes seleccionar un vendedor de destino.');
      return;
    }
    if (!contextNote.trim()) {
      setError('La nota de contexto es obligatoria para transferir.');
      return;
    }

    onConfirmTransfer({
      chatId,
      targetSellerId,
      reason,
      contextNote: contextNote.trim(),
    });
    setContextNote('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-[#f0f2f5] dark:bg-[#111b21]">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold">
            <UserPlus className="w-5 h-5" />
            <h3 className="text-base text-gray-900 dark:text-gray-100">Transferencia de Chat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
            <p className="text-gray-700 dark:text-gray-200 font-medium">
              Cliente: <span className="font-bold text-emerald-400">{contactName}</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
              Vendedor origen: <span className="font-semibold text-gray-300">{currentSellerName || 'Sin Asignar'}</span>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg text-[11px]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Seller */}
          <div>
            <label className="block text-gray-400 font-medium mb-1.5">
              Vendedor Destino <span className="text-rose-400">*</span>
            </label>
            <select
              value={targetSellerId}
              onChange={(e) => {
                setTargetSellerId(e.target.value);
                setError('');
              }}
              className="w-full bg-gray-50 dark:bg-[#182229] border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00a884]"
            >
              <option value="">-- Selecciona el destinatario --</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role === 'admin' ? 'Administrador' : `Capacidad ${s.assignedChatsCount} chats`})
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-gray-400 font-medium mb-1.5">
              Motivo de Transferencia
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#182229] border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00a884]"
            >
              <option value="Cotización de Servicio">Cotización de Servicio</option>
              <option value="Soporte Técnico Especializado">Soporte Técnico Especializado</option>
              <option value="Cambio de Turno / Horario">Cambio de Turno / Horario</option>
              <option value="Atención Negociación Cierre">Atención Negociación Cierre</option>
              <option value="Reasignación por Carga Comercial">Reasignación por Carga Comercial</option>
            </select>
          </div>

          {/* Context Note (Mandatory) */}
          <div>
            <label className="block text-gray-400 font-medium mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Nota Obligatoria de Contexto <span className="text-rose-400">*</span></span>
              </span>
              <span className="text-[10px] text-gray-500">Ej: "Interesado en Plan Pro. Espera demo."</span>
            </label>
            <textarea
              rows={3}
              placeholder="Escribe detalles clave que el nuevo vendedor deba conocer antes de responder..."
              value={contextNote}
              onChange={(e) => {
                setContextNote(e.target.value);
                setError('');
              }}
              className="w-full bg-gray-50 dark:bg-[#182229] border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00a884]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#00a884] hover:bg-[#008f70] text-white rounded-xl font-bold transition-colors shadow-md"
            >
              Transferir Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
