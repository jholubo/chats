import React, { useState } from 'react';
import { CloseChatPayload } from '../../types';
import { Archive, X, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface CloseChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  contactName: string;
  onConfirmClose: (payload: CloseChatPayload) => void;
}

export const CloseChatModal: React.FC<CloseChatModalProps> = ({
  isOpen,
  onClose,
  chatId,
  contactName,
  onConfirmClose,
}) => {
  const [outcome, setOutcome] = useState<'CLOSED_WON' | 'CLOSED_LOST'>('CLOSED_WON');
  const [reasonNote, setReasonNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmClose({
      chatId,
      outcome,
      reasonNote: reasonNote.trim() || (outcome === 'CLOSED_WON' ? 'Venta exitosa' : 'Cliente declinó'),
    });
    setReasonNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-[#f0f2f5] dark:bg-[#111b21]">
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
            <Archive className="w-5 h-5 text-amber-400" />
            <h3 className="text-base">Cierre de Conversación</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <p className="text-gray-400">
            Estás finalizando la atención para <span className="font-bold text-gray-200">{contactName}</span>. Selecciona el resultado comercial:
          </p>

          {/* Outcome Radio Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOutcome('CLOSED_WON')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                outcome === 'CLOSED_WON'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold shadow-sm'
                  : 'bg-gray-50 dark:bg-[#182229] border-gray-200 dark:border-gray-700 text-gray-400 hover:border-emerald-500/40'
              }`}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>Cerrado Ganado</span>
            </button>

            <button
              type="button"
              onClick={() => setOutcome('CLOSED_LOST')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                outcome === 'CLOSED_LOST'
                  ? 'bg-rose-500/15 border-rose-500 text-rose-400 font-bold shadow-sm'
                  : 'bg-gray-50 dark:bg-[#182229] border-gray-200 dark:border-gray-700 text-gray-400 hover:border-rose-500/40'
              }`}
            >
              <XCircle className="w-6 h-6 text-rose-400" />
              <span>Cerrado Perdido</span>
            </button>
          </div>

          {/* Reason Note */}
          <div>
            <label className="block text-gray-400 font-medium mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Motivo de Cierre / Resumen Comercial</span>
            </label>
            <input
              type="text"
              placeholder={
                outcome === 'CLOSED_WON'
                  ? 'Ej: Venta de Plan Empresarial confirmada por transferencia...'
                  : 'Ej: Presupuesto fuera de su alcance actual...'
              }
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#182229] border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00a884]"
            />
          </div>

          {/* Buttons */}
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
              className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors shadow-md ${
                outcome === 'CLOSED_WON'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              Confirmar Cierre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
