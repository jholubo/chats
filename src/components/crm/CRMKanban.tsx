import React, { useState } from 'react';
import {
  Plus,
  Search,
  DollarSign,
  Tag,
  Phone,
  MessageSquare,
  UserCheck,
  ChevronRight,
  Clock,
  FileText,
  Building,
  Star,
  MoreVertical,
  X,
} from 'lucide-react';
import { CRMStage, CRMDeal, CRMNote, Conversation } from '../../types';

interface CRMKanbanProps {
  stages: CRMStage[];
  deals: CRMDeal[];
  notes: CRMNote[];
  conversations: Conversation[];
  onMoveDeal: (dealId: string, newStageId: string) => void;
  onOpenChat: (contactPhoneOrId: string) => void;
  onAddDeal: (deal: Partial<CRMDeal>) => void;
  onAddNote: (contactId: string, noteText: string) => void;
}

export const CRMKanban: React.FC<CRMKanbanProps> = ({
  stages,
  deals,
  notes,
  conversations,
  onMoveDeal,
  onOpenChat,
  onAddDeal,
  onAddNote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<CRMDeal | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New deal form state
  const [newTitle, setNewTitle] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newValue, setNewValue] = useState(2500);

  const filteredDeals = deals.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPipelineValue = deals.reduce((acc, d) => acc + d.value, 0);

  const handleCreateDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContactName) return;

    onAddDeal({
      title: newTitle,
      contactName: newContactName,
      contactPhone: newContactPhone || '+57 300 000 0000',
      value: Number(newValue),
      currency: 'USD',
      stageId: stages[0]?.id || 'stg_lead',
      tags: ['Inbound', 'SaaS'],
      assignedToAgentName: 'Jhonnyl Lubo',
    });

    setNewTitle('');
    setNewContactName('');
    setNewContactPhone('');
    setShowAddModal(false);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal || !newNoteText.trim()) return;

    onAddNote(selectedDeal.contactId, newNoteText);
    setNewNoteText('');
  };

  return (
    <div className="flex-1 bg-[#111b21] flex flex-col h-full overflow-hidden text-gray-100">
      {/* Top CRM Header */}
      <div className="bg-[#202c33] px-6 py-4 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Pipeline de Ventas CRM</h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
              WhatsApp Integrated
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Gestión omnicanal de tratos, estados de leads y sincronización bidireccional de chats.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#111b21] px-3 py-1.5 rounded-xl border border-gray-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Valor Total Pipeline:</span>
            <span className="text-sm font-bold text-white">${totalPipelineValue.toLocaleString()} USD</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por trato, cliente o etiqueta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111b21] text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884] w-64"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#00a884] hover:bg-[#008069] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nuevo Trato
          </button>
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <div className="flex-1 overflow-x-auto p-6 flex gap-4 custom-scrollbar">
        {stages.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stageId === stage.id);
          const stageTotalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.id}
              className="w-80 flex-shrink-0 bg-[#182229] rounded-2xl border border-gray-800 flex flex-col max-h-full"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="font-semibold text-sm text-gray-200">{stage.name}</h3>
                  <span className="bg-[#202c33] text-gray-400 text-[11px] px-2 py-0.5 rounded-full font-medium">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  ${stageTotalValue.toLocaleString()}
                </span>
              </div>

              {/* Cards Scroll Area */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                {stageDeals.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-xl">
                    Sin tratos en esta etapa
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className={`p-4 bg-[#202c33] hover:bg-[#222e35] rounded-xl border transition-all cursor-pointer shadow-sm group ${
                        selectedDeal?.id === deal.id
                          ? 'border-[#00a884] ring-1 ring-[#00a884]'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-xs text-gray-100 group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {deal.title}
                        </h4>
                        <span className="text-xs font-bold text-emerald-400 ml-2">
                          ${deal.value.toLocaleString()}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-800/80">
                        {deal.contactAvatar ? (
                          <img
                            src={deal.contactAvatar}
                            alt={deal.contactName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-[10px] font-bold">
                            {deal.contactName.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs text-gray-300 font-medium truncate">
                          {deal.contactName}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {deal.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-[#111b21] text-gray-400 px-2 py-0.5 rounded border border-gray-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Stage Move Action Bar */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800/60 text-[11px] text-gray-400">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChat(deal.contactPhone);
                          }}
                          className="flex items-center gap-1 text-emerald-400 hover:underline"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat WhatsApp
                        </button>

                        <select
                          value={deal.stageId}
                          onChange={(e) => {
                            e.stopPropagation();
                            onMoveDeal(deal.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-[#111b21] text-[10px] text-gray-300 rounded px-1.5 py-0.5 border border-gray-700 focus:outline-none"
                        >
                          {stages.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Deal Detail & Notes Panel */}
      {selectedDeal && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#202c33] border-l border-gray-800 shadow-2xl z-40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-700 pb-4">
              <h2 className="text-base font-bold text-white">Detalles de Oportunidad</h2>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Trato</span>
                <h3 className="text-sm font-semibold text-emerald-400 mt-0.5">{selectedDeal.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#111b21] p-3 rounded-xl border border-gray-800 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px]">Monto</span>
                  <p className="font-bold text-white">${selectedDeal.value.toLocaleString()} {selectedDeal.currency}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px]">Agente Asignado</span>
                  <p className="font-medium text-gray-200">{selectedDeal.assignedToAgentName}</p>
                </div>
              </div>

              <div className="bg-[#182229] p-3 rounded-xl border border-gray-800 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-200 font-mono">{selectedDeal.contactPhone}</span>
                </div>
                <button
                  onClick={() => onOpenChat(selectedDeal.contactPhone)}
                  className="w-full bg-[#00a884] hover:bg-[#008069] text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ir a conversación en LuboChat
                </button>
              </div>

              {/* Notes Timeline Section */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Notas del Cliente
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {notes
                    .filter((n) => n.contactId === selectedDeal.contactId)
                    .map((note) => (
                      <div key={note.id} className="bg-[#111b21] p-2.5 rounded-lg border border-gray-800 text-xs">
                        <p className="text-gray-200">{note.text}</p>
                        <span className="text-[10px] text-gray-500 mt-1 block text-right">
                          {note.authorName} • {note.createdAt}
                        </span>
                      </div>
                    ))}
                </div>

                <form onSubmit={handleAddNoteSubmit} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar nota interna..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 bg-[#111b21] text-xs px-3 py-2 rounded-lg border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#00a884]"
                  />
                  <button
                    type="submit"
                    className="bg-[#00a884] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#008069]"
                  >
                    Guardar
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 text-center border-t border-gray-800 pt-3">
            ID Trato: {selectedDeal.id}
          </div>
        </div>
      )}

      {/* Modal create new deal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#202c33] border border-gray-700 rounded-2xl w-full max-w-md p-6 text-white space-y-4">
            <h3 className="text-base font-bold text-white">Nuevo Trato CRM</h3>
            <form onSubmit={handleCreateDealSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Título de la Oportunidad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Licencia WABA Pro 10 Agentes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Nombre del Contacto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Mendoza"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Teléfono WhatsApp</label>
                <input
                  type="text"
                  placeholder="+57 300 000 0000"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Valor Trato (USD)</label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="w-full bg-[#111b21] p-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-[#182229]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#00a884] hover:bg-[#008069] text-white font-bold px-4 py-2 rounded-xl"
                >
                  Crear Oportunidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
