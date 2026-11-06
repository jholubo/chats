import React, { useState } from 'react';
import { Conversation, Seller, CrmStage, FollowUpReminder, ActivityEvent } from '../../types';
import {
  X,
  Phone,
  Video,
  Search,
  Bell,
  Star,
  ShieldCheck,
  Building2,
  FileText,
  MapPin,
  Clock,
  UserPlus,
  Tag,
  History,
  CheckCircle2,
  Plus,
  Send,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface ChatInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  sellers?: Seller[];
  onChangeCrmStage?: (chatId: string, stage: CrmStage) => void;
  onTransferChat?: (chatId: string, targetSellerId: string) => void;
  onAddReminder?: (chatId: string, reminderTimeText: string, noteText: string) => void;
  onCompleteReminder?: (chatId: string, reminderId: string) => void;
  onAddContactNote?: (contactId: string, noteText: string) => void;
  id?: string;
}

const CRM_STAGES: CrmStage[] = ['Nuevo', 'Contactado', 'Cotización', 'Negociación', 'Ganado', 'Perdido'];

export const ChatInfoDrawer: React.FC<ChatInfoDrawerProps> = ({
  isOpen,
  onClose,
  conversation,
  sellers = [],
  onChangeCrmStage,
  onTransferChat,
  onAddReminder,
  onCompleteReminder,
  onAddContactNote,
  id,
}) => {
  const [showTransferSelect, setShowTransferSelect] = useState(false);
  const [selectedSellerForTransfer, setSelectedSellerForTransfer] = useState('');
  
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderPreset, setReminderPreset] = useState<'1h' | 'tomorrow' | 'custom'>('1h');
  const [reminderNote, setReminderNote] = useState('');

  const [newNoteText, setNewNoteText] = useState('');

  if (!isOpen) return null;

  const { contact, isGroup, groupName, groupAvatar } = conversation;
  const displayName = isGroup ? groupName : contact.name;
  const avatarSrc = isGroup ? groupAvatar || contact.avatar : contact.avatar;

  const currentStage: CrmStage = conversation.crmStage || contact.crmStage || 'Nuevo';
  const activityTimeline: ActivityEvent[] = conversation.activityTimeline || [];
  const reminders: FollowUpReminder[] = conversation.reminders || [];

  const handleCreateReminder = () => {
    if (!reminderNote.trim()) return;
    let timeText = 'En 1 hora';
    if (reminderPreset === 'tomorrow') timeText = 'Mañana a las 09:00 AM';
    if (reminderPreset === 'custom') timeText = 'En 2 días a las 10:00 AM';

    onAddReminder?.(conversation.id, timeText, reminderNote.trim());
    setReminderNote('');
    setShowReminderForm(false);
  };

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    onAddContactNote?.(contact.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleExecuteTransfer = () => {
    if (!selectedSellerForTransfer) return;
    onTransferChat?.(conversation.id, selectedSellerForTransfer);
    setShowTransferSelect(false);
  };

  return (
    <div
      id={id}
      className="w-80 h-full bg-[#f0f2f5] dark:bg-[#111b21] border-l border-gray-200 dark:border-gray-800 flex flex-col z-30 overflow-y-auto select-none"
    >
      {/* Drawer Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {isGroup ? 'Info. del grupo' : 'Info. del contacto'}
        </h2>
      </div>

      {/* Main Container */}
      <div className="p-4 space-y-4">
        {/* Contact Profile Header */}
        <div className="flex flex-col items-center bg-white dark:bg-[#202c33] p-5 rounded-2xl shadow-sm">
          <Avatar src={avatarSrc} alt={displayName || ''} size="xl" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-3 text-center">
            {displayName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
            {contact.phoneNumber}
          </p>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => alert(`Llamando a ${contact.phoneNumber}...`)}
              className="p-2.5 bg-gray-100 dark:bg-[#182229] hover:bg-gray-200 text-[#00a884] rounded-xl transition-colors"
              title="Llamada de voz"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert(`Iniciando videollamada con ${displayName}...`)}
              className="p-2.5 bg-gray-100 dark:bg-[#182229] hover:bg-gray-200 text-[#00a884] rounded-xl transition-colors"
              title="Videollamada"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert('Búsqueda en mensajes del chat')}
              className="p-2.5 bg-gray-100 dark:bg-[#182229] hover:bg-gray-200 text-[#00a884] rounded-xl transition-colors"
              title="Buscar en chat"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CRM STAGE Visual Selector (Requirement 7) */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-200">
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Etapa CRM de Venta</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              {currentStage}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {CRM_STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => onChangeCrmStage?.(conversation.id, stage)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between border ${
                  currentStage === stage
                    ? 'bg-[#00a884] text-white border-[#00a884] shadow-sm font-semibold'
                    : 'bg-gray-50 dark:bg-[#182229] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#00a884]/50'
                }`}
              >
                <span>{stage}</span>
                {currentStage === stage && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* ASSIGNED SELLER & TRANSFER CONTROL (Requirement 3) */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vendedor Asignado</span>
            <button
              onClick={() => setShowTransferSelect(!showTransferSelect)}
              className="text-[11px] text-[#00a884] hover:underline flex items-center gap-1 font-medium"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Transferir</span>
            </button>
          </div>

          <div className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{conversation.assignedSellerName || 'Sin Asignar (Chat Nuevo)'}</span>
          </div>

          {/* Transfer Seller Selector */}
          {showTransferSelect && (
            <div className="bg-gray-50 dark:bg-[#182229] p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
              <label className="text-[11px] font-medium text-gray-400 block">
                Seleccionar Vendedor Destino:
              </label>
              <select
                value={selectedSellerForTransfer}
                onChange={(e) => setSelectedSellerForTransfer(e.target.value)}
                className="w-full text-xs p-2 rounded bg-white dark:bg-[#202c33] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value="">-- Escoge un vendedor --</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role === 'admin' ? 'Admin' : `${s.assignedPercentage}%`})
                  </option>
                ))}
              </select>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleExecuteTransfer}
                  disabled={!selectedSellerForTransfer}
                  className="flex-1 py-1.5 bg-[#00a884] hover:bg-[#008f70] text-white text-xs font-bold rounded-lg disabled:opacity-50"
                >
                  Confirmar Transferencia
                </button>
                <button
                  onClick={() => setShowTransferSelect(false)}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOLLOW-UP REMINDERS (Requirement 6) */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Bell className="w-4 h-4 fill-amber-400" />
              <span>Recordatorios ({reminders.filter((r) => !r.isCompleted).length})</span>
            </span>
            <button
              onClick={() => setShowReminderForm(!showReminderForm)}
              className="text-[11px] bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </button>
          </div>

          {/* Form Create Reminder */}
          {showReminderForm && (
            <div className="bg-gray-50 dark:bg-[#182229] p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
              <label className="text-[11px] font-medium text-gray-400 block">Tiempo de Alerta:</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setReminderPreset('1h')}
                  className={`py-1 text-[10px] rounded border ${
                    reminderPreset === '1h'
                      ? 'bg-amber-500 text-amber-950 font-bold border-amber-500'
                      : 'bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
                  En 1 hora
                </button>
                <button
                  onClick={() => setReminderPreset('tomorrow')}
                  className={`py-1 text-[10px] rounded border ${
                    reminderPreset === 'tomorrow'
                      ? 'bg-amber-500 text-amber-950 font-bold border-amber-500'
                      : 'bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
                  Mañana 9 AM
                </button>
                <button
                  onClick={() => setReminderPreset('custom')}
                  className={`py-1 text-[10px] rounded border ${
                    reminderPreset === 'custom'
                      ? 'bg-amber-500 text-amber-950 font-bold border-amber-500'
                      : 'bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
                  En 2 días
                </button>
              </div>

              <input
                type="text"
                placeholder="Nota del recordatorio (ej. Enviar propuesta)..."
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                className="w-full text-xs p-2 rounded bg-white dark:bg-[#202c33] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none"
              />

              <button
                onClick={handleCreateReminder}
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg"
              >
                Guardar Recordatorio
              </button>
            </div>
          )}

          {/* Reminder List */}
          <div className="space-y-1.5">
            {reminders.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">No hay recordatorios pendientes para este chat.</p>
            ) : (
              reminders.map((r) => (
                <div
                  key={r.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                    r.isCompleted
                      ? 'bg-gray-50 dark:bg-[#182229] border-gray-700 opacity-60 line-through'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[11px] flex items-center gap-1 text-amber-400">
                      <Clock className="w-3 h-3" />
                      <span>{r.reminderTime}</span>
                    </div>
                    <p className="mt-0.5 text-gray-300">{r.note}</p>
                  </div>
                  {!r.isCompleted && (
                    <button
                      onClick={() => onCompleteReminder?.(conversation.id, r.id)}
                      className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded hover:bg-emerald-900"
                      title="Marcar como listo"
                    >
                      Listo
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* INTERNAL ACTIVITY TIMELINE (Requirement 4) */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-gray-100">
            <History className="w-4 h-4 text-blue-400" />
            <span>Historial de Actividad Interno</span>
          </div>

          <div className="relative border-l border-gray-700 ml-2 space-y-3 pt-1">
            {activityTimeline.length === 0 ? (
              <p className="pl-4 text-[11px] text-gray-400">Sin eventos registrados en el timeline.</p>
            ) : (
              activityTimeline.map((ev) => (
                <div key={ev.id} className="relative pl-4 text-xs">
                  {/* Timeline Dot */}
                  <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#202c33]" />
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-semibold text-blue-300">{ev.actorName}</span>
                    <span>{ev.timestamp}</span>
                  </div>
                  <h5 className="font-medium text-gray-200 text-xs mt-0.5">{ev.title}</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5">{ev.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* INTERNAL NOTES & FOLLOW-UP */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-2xl shadow-sm space-y-3">
          <h4 className="text-xs font-semibold text-gray-400">Notas Privadas del Vendedor</h4>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Agregar nota de cliente..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="flex-1 text-xs p-2 rounded bg-gray-50 dark:bg-[#182229] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
            />
            <button
              onClick={handleSaveNote}
              className="p-2 bg-[#00a884] text-white rounded-lg hover:bg-[#008f70]"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {contact.notes && contact.notes.length > 0 && (
            <div className="space-y-2 pt-1">
              {contact.notes.map((n) => (
                <div key={n.id} className="bg-gray-50 dark:bg-[#182229] p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-[10px] text-emerald-400 font-medium">
                    <span>{n.authorName}</span>
                    <span className="text-gray-400">{n.createdAt}</span>
                  </div>
                  <p className="text-gray-200 text-xs">{n.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp Business Verified Card */}
        {contact.isBusiness && contact.businessInfo && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <Building2 className="w-4 h-4" />
              <span>Cuenta de WhatsApp Business</span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {contact.businessInfo.description}
            </p>
            <div className="pt-2 text-[11px] text-gray-600 dark:text-gray-400 space-y-1">
              <p>📍 {contact.businessInfo.category}</p>
              <p>📧 {contact.businessInfo.email}</p>
              <p>🌐 {contact.businessInfo.website}</p>
            </div>
          </div>
        )}

        {/* Media Gallery Preview */}
        <div className="bg-white dark:bg-[#202c33] p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              Archivos, enlaces y docs
            </span>
            <span className="text-xs text-[#00a884] cursor-pointer">3 &gt;</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80"
                alt="Shared Media"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center text-red-500">
              <FileText className="w-6 h-6" />
            </div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center text-emerald-500">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
