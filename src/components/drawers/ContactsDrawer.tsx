import React, { useState } from 'react';
import {
  X,
  Search,
  UserPlus,
  RefreshCw,
  Phone,
  Mail,
  Building,
  Tag,
  FileText,
  Clock,
  Plus,
  CheckCircle2,
  User,
  MessageSquare,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Contact, ContactNote, Seller } from '../../types';

interface ContactsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  sellers: Seller[];
  onSaveContact: (contact: Partial<Contact>) => void;
  onAddContactNote: (contactId: string, noteText: string) => void;
  onOpenChat: (contactPhoneOrId: string) => void;
}

export const ContactsDrawer: React.FC<ContactsDrawerProps> = ({
  isOpen,
  onClose,
  contacts,
  sellers,
  onSaveContact,
  onAddContactNote,
  onOpenChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] || null);
  const [isSyncingWA, setIsSyncingWA] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddContactForm, setShowAddContactForm] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formTags, setFormTags] = useState('Cliente VIP, Cotización');

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSyncWhatsApp = () => {
    setIsSyncingWA(true);
    setTimeout(() => {
      setIsSyncingWA(false);
      alert('Sincronización completada con la libreta de contactos de WhatsApp Business.');
    }, 1200);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !newNoteText.trim()) return;
    onAddContactNote(selectedContact.id, newNoteText);
    setNewNoteText('');
  };

  const handleCreateContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    onSaveContact({
      name: formName,
      phoneNumber: formPhone,
      email: formEmail,
      company: formCompany,
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCompany('');
    setShowAddContactForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#111b21] border border-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] text-gray-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#202c33] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-100">
                Sistema de Contactos e Historial Empresarial
              </h2>
              <p className="text-xs text-gray-400">
                Sincronización WhatsApp, notas privadas y gestión de etiquetas por cliente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncWhatsApp}
              disabled={isSyncingWA}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202c33] hover:bg-gray-700 border border-gray-700 text-emerald-400 text-xs rounded-xl font-medium transition-colors"
              title="Sincronizar contactos desde la API oficial de WhatsApp"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWA ? 'animate-spin' : ''}`} />
              <span>{isSyncingWA ? 'Sincronizando...' : 'Sincronizar WA'}</span>
            </button>

            <button
              onClick={() => setShowAddContactForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a884] hover:bg-emerald-600 text-white text-xs rounded-xl font-medium transition-colors shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nuevo Contacto</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Split: Left Contact List, Right Contact Details */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT CONTACTS LIST */}
          <div className="w-full md:w-[320px] lg:w-[360px] border-r border-gray-800 flex flex-col bg-[#111b21]">
            
            {/* Search Input */}
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar contacto por nombre o número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#202c33] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowAddContactForm(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                    selectedContact?.id === contact.id
                      ? 'bg-[#202c33] border border-gray-700 shadow-sm'
                      : 'hover:bg-[#182229]'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-9 h-9 rounded-full object-cover border border-emerald-500/40 flex-shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-xs text-gray-200 truncate">{contact.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{contact.phoneNumber}</div>
                    </div>
                  </div>

                  {contact.assignedSellerName && (
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800 font-mono flex-shrink-0">
                      Asignado
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT DETAILS VIEW */}
          <div className="flex-1 flex flex-col bg-[#0c1317] overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {showAddContactForm ? (
              /* ADD NEW CONTACT FORM */
              <form onSubmit={handleCreateContactSubmit} className="space-y-4 bg-[#111b21] p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Registrar Nuevo Contacto Empresarial
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddContactForm(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Volver a Detalle
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carlos Eduardo"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#202c33] border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Número de WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="+57 300 000 0000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-[#202c33] border border-gray-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="carlos@empresa.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-[#202c33] border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Empresa / Organización</label>
                    <input
                      type="text"
                      placeholder="Ej: Servicios LatAm"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      className="w-full bg-[#202c33] border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 text-xs">Etiquetas (Separadas por comas)</label>
                  <input
                    type="text"
                    placeholder="Cliente VIP, Cotización, Urgente"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full bg-[#202c33] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddContactForm(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#00a884] hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow"
                  >
                    Guardar Contacto
                  </button>
                </div>
              </form>
            ) : selectedContact ? (
              /* SELECTED CONTACT DETAILS VIEW */
              <>
                {/* Contact Card Header */}
                <div className="bg-[#111b21] p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-lg"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                        {selectedContact.name}
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                          WhatsApp Sincronizado
                        </span>
                      </h3>
                      <div className="text-xs text-gray-400 font-mono flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {selectedContact.phoneNumber}
                        </span>
                        {selectedContact.company && (
                          <span className="flex items-center gap-1 text-gray-300">
                            <Building className="w-3.5 h-3.5 text-blue-400" />
                            {selectedContact.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onOpenChat(selectedContact.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#00a884] hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Abrir Chat WhatsApp</span>
                  </button>
                </div>

                {/* Tags & Assignment Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#111b21] p-4 rounded-xl border border-gray-800 space-y-2">
                    <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      Etiquetas del Contacto
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedContact.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                            tag === 'CHAT NUEVO'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : tag.startsWith('Asignado')
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-gray-800 text-gray-300 border-gray-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#111b21] p-4 rounded-xl border border-gray-800 space-y-2">
                    <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      Vendedor Asignado
                    </div>
                    <div className="text-xs font-semibold text-emerald-300 pt-1">
                      {selectedContact.assignedSellerName || 'Sin asignar (Disponible en bolsa)'}
                    </div>
                  </div>
                </div>

                {/* NOTES TIMELINE (NOTAS INTERNAS PRIVADAS) */}
                <div className="bg-[#111b21] p-5 rounded-2xl border border-gray-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Historial de Notas de Seguimiento Interno
                    </h4>
                    <span className="text-[11px] text-gray-400">Visibles solo para el equipo</span>
                  </div>

                  {/* Add Note Input Form */}
                  <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Escribir una nota o avance de vendedor..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 bg-[#202c33] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Nota</span>
                    </button>
                  </form>

                  {/* Timeline Notes List */}
                  <div className="space-y-3 pt-2">
                    {selectedContact.notes && selectedContact.notes.length > 0 ? (
                      selectedContact.notes.map((note) => (
                        <div key={note.id} className="bg-[#182229] p-3 rounded-xl border border-gray-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-emerald-400">{note.authorName}</span>
                            <span className="text-gray-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-gray-500" />
                              {note.createdAt}
                            </span>
                          </div>
                          <p className="text-xs text-gray-200 leading-relaxed">{note.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-xs">
                        No hay notas internas registradas aún para este contacto.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 text-xs">
                Selecciona un contacto para ver sus detalles e historial.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
