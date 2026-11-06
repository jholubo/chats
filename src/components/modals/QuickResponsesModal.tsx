import React, { useState } from 'react';
import { QuickResponse } from '../../types';
import { Zap, Plus, Trash2, X, Check, Search, HelpCircle } from 'lucide-react';

interface QuickResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickResponses: QuickResponse[];
  onAddQuickResponse: (qr: Omit<QuickResponse, 'id'>) => void;
  onDeleteQuickResponse: (id: string) => void;
  id?: string;
}

export const QuickResponsesModal: React.FC<QuickResponsesModalProps> = ({
  isOpen,
  onClose,
  quickResponses,
  onAddQuickResponse,
  onDeleteQuickResponse,
  id,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [shortcut, setShortcut] = useState('/');
  const [category, setCategory] = useState('Ventas');
  const [text, setText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const filteredResponses = quickResponses.filter((qr) =>
    qr.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    let formattedShortcut = shortcut.trim();
    if (!formattedShortcut.startsWith('/')) {
      formattedShortcut = `/${formattedShortcut}`;
    }

    onAddQuickResponse({
      shortcut: formattedShortcut,
      category: category.trim() || 'General',
      text: text.trim(),
    });

    setShortcut('/');
    setCategory('Ventas');
    setText('');
    setIsCreating(false);
    setSuccessMsg(`Respuesta rápida "${formattedShortcut}" creada con éxito.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#f0f2f5] dark:bg-[#111b21] border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Gestión de Respuestas Rápidas
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Crea comandos automáticos (ej: <code className="text-[#00a884]">/pre</code>) para agilizar tus chats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Create Form Toggle Button / Form */}
          {!isCreating ? (
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar comando o texto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-[#111b21] border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:border-[#00a884]"
                />
              </div>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-[#00a884] hover:bg-[#008f70] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Respuesta</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-[#111b21] border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-xs font-bold text-[#00a884] uppercase tracking-wider">
                  Crear Nueva Respuesta Rápida
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-gray-400 hover:text-gray-200"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Comando / Atajo
                  </label>
                  <input
                    type="text"
                    placeholder="/pre"
                    value={shortcut}
                    onChange={(e) => setShortcut(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#202c33] border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#00a884]"
                    required
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Ej: /pre, /precio, /saludo</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    placeholder="Ventas"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#202c33] border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:border-[#00a884]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Ej: Ventas, Información, Saludos</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Texto del mensaje
                </label>
                <textarea
                  rows={4}
                  placeholder="Escribe el mensaje completo que reemplazará el comando..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#202c33] border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:border-[#00a884] resize-none"
                  required
                />
              </div>

              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-300 flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Tip de variables:</strong> Puedes incluir <code className="text-emerald-400">{"{{nombre_cliente}}"}</code> o <code className="text-emerald-400">{"{{nombre_vendedor}}"}</code> y se reemplazarán automáticamente al enviar.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00a884] hover:bg-[#008f70] text-white text-xs font-bold rounded-lg shadow"
                >
                  Guardar Respuesta
                </button>
              </div>
            </form>
          )}

          {/* Quick Responses List */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Lista de Respuestas ({filteredResponses.length})
            </span>

            {filteredResponses.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 dark:bg-[#111b21] rounded-2xl border border-dashed border-gray-300 dark:border-gray-800">
                No se encontraron respuestas rápidas.
              </div>
            ) : (
              filteredResponses.map((qr) => (
                <div
                  key={qr.id}
                  className="p-3.5 bg-gray-50 dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 rounded-xl flex items-start justify-between gap-3 hover:border-gray-300 dark:hover:border-gray-700 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-[#00a884]/20 text-[#00a884] font-mono font-bold text-xs rounded-md">
                        {qr.shortcut}
                      </span>
                      {qr.category && (
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-medium rounded-md">
                          {qr.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-sans">
                      {qr.text}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`¿Seguro que deseas eliminar la respuesta "${qr.shortcut}"?`)) {
                        onDeleteQuickResponse(qr.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                    title="Borrar respuesta rápida"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#f0f2f5] dark:bg-[#111b21] border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
