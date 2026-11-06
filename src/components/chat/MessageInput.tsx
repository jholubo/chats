import React, { useState, useRef } from 'react';
import { Smile, Paperclip, Mic, Send, X, Lock, Zap, Plus, Trash2, Check } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { AttachmentMenu } from './AttachmentMenu';
import { VoiceRecorder } from './VoiceRecorder';
import { Message, MessageType, QuickResponse } from '../../types';

interface MessageInputProps {
  onSendMessage: (params: {
    type: MessageType;
    content: string;
    mediaUrl?: string;
    fileName?: string;
    fileSize?: string;
    location?: { lat: number; lng: number; name: string; address: string };
    replyToId?: string;
  }) => void;
  replyingToMessage?: Message | null;
  onCancelReply?: () => void;
  onUserTyping?: (isTyping: boolean) => void;
  isLockedByOther?: boolean;
  lockedBySellerName?: string;
  quickResponses?: QuickResponse[];
  onAddQuickResponse?: (qr: Omit<QuickResponse, 'id'>) => void;
  onDeleteQuickResponse?: (id: string) => void;
  contactName?: string;
  sellerName?: string;
  id?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyingToMessage,
  onCancelReply,
  onUserTyping,
  isLockedByOther,
  lockedBySellerName,
  quickResponses = [],
  onAddQuickResponse,
  onDeleteQuickResponse,
  contactName = 'Cliente',
  sellerName = 'Vendedor',
  id,
}) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Form state for creating a quick response inline
  const [isCreatingQr, setIsCreatingQr] = useState(false);
  const [newShortcut, setNewShortcut] = useState('/');
  const [newCategory, setNewCategory] = useState('Ventas');
  const [newText, setNewText] = useState('');
  const [qrCreatedSuccess, setQrCreatedSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const isSlashTrigger = text.startsWith('/');
  const filteredQuickResponses = quickResponses.filter((qr) =>
    qr.shortcut.toLowerCase().includes(text.toLowerCase()) ||
    qr.text.toLowerCase().includes(text.toLowerCase()) ||
    (qr.category && qr.category.toLowerCase().includes(text.toLowerCase()))
  );

  const expandVariables = (templateText: string) => {
    return templateText
      .replace(/\{\{nombre_cliente\}\}/gi, contactName)
      .replace(/\{\{nombre_vendedor\}\}/gi, sellerName)
      .replace(/\{\{cliente\}\}/gi, contactName)
      .replace(/\{\{vendedor\}\}/gi, sellerName);
  };

  const tryExpandCommand = (inputText: string): string | null => {
    if (!inputText) return null;
    const trimmed = inputText.trim();

    for (const qr of quickResponses) {
      if (!qr.shortcut) continue;
      const shortcut = qr.shortcut.trim().toLowerCase(); // e.g. "/pre"

      // Match exact command (e.g. "/pre") or command + space (e.g. "/pre ")
      if (trimmed.toLowerCase() === shortcut || inputText.toLowerCase() === `${shortcut} `) {
        return expandVariables(qr.text);
      }

      // Match command within sentence with word boundary
      const regex = new RegExp(`(^|\\s)${shortcut.replace('/', '\\/')}(\\s|$)`, 'i');
      if (regex.test(inputText)) {
        return inputText.replace(
          new RegExp(`(^|\\s)${shortcut.replace('/', '\\/')}(\\s|$)`, 'i'),
          `$1${expandVariables(qr.text)} `
        );
      }
    }
    return null;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    const autoExpanded = tryExpandCommand(val);
    if (autoExpanded !== null) {
      setText(autoExpanded);
      setShowQuickResponses(false);
    } else {
      setText(val);
      if (val.startsWith('/')) {
        setShowQuickResponses(true);
      } else {
        setShowQuickResponses(false);
      }
    }

    if (onUserTyping) {
      onUserTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onUserTyping(false);
      }, 2000);
    }
  };

  const handleSelectQuickResponse = (qrText: string) => {
    const expandedText = expandVariables(qrText);
    setText(expandedText);
    setShowQuickResponses(false);
    inputRef.current?.focus();
  };

  const handleSaveNewQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    let shortcut = newShortcut.trim();
    if (!shortcut.startsWith('/')) {
      shortcut = `/${shortcut}`;
    }

    if (onAddQuickResponse) {
      onAddQuickResponse({
        shortcut,
        category: newCategory.trim() || 'General',
        text: newText.trim(),
      });
    }

    setNewText('');
    setIsCreatingQr(false);
    setQrCreatedSuccess(true);
    setTimeout(() => setQrCreatedSuccess(false), 2000);
  };

  const handleSend = () => {
    if (!text.trim() || isLockedByOther) return;
    onSendMessage({
      type: 'text',
      content: text.trim(),
      replyToId: replyingToMessage?.id,
    });
    setText('');
    setShowEmoji(false);
    setShowQuickResponses(false);
    onCancelReply?.();
    if (onUserTyping) onUserTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSelectAttachmentType = (type: 'image' | 'document' | 'location' | 'contact' | 'sticker') => {
    if (isLockedByOther) return;
    if (type === 'image') {
      onSendMessage({
        type: 'image',
        content: 'Captura de pantalla de la plataforma SaaS LuboChat',
        mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        fileName: 'captura_lubochat.jpg',
        fileSize: '1.2 MB',
      });
    } else if (type === 'document') {
      onSendMessage({
        type: 'document',
        content: 'manual_integracion_waba_2026.pdf',
        mediaUrl: '#',
        fileName: 'manual_integracion_waba_2026.pdf',
        fileSize: '3.4 MB',
      });
    } else if (type === 'location') {
      onSendMessage({
        type: 'location',
        content: 'Ubicación de la oficina principal',
        location: {
          lat: 4.60971,
          lng: -74.08175,
          name: 'LuboChat HQ - Tech Park',
          address: 'Av. El Dorado #68B-31, Bogotá',
        },
      });
    } else if (type === 'sticker') {
      onSendMessage({
        type: 'sticker',
        content: '🎨 [Sticker]',
      });
    }
  };

  const handleSendVoiceNote = (durationSecs: number) => {
    setIsRecording(false);
    onSendMessage({
      type: 'audio',
      content: `Nota de voz (${durationSecs}s)`,
      mediaUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
    });
  };

  if (isLockedByOther) {
    return (
      <div id={id} className="p-3 bg-red-950/80 border-t border-red-700/60 flex items-center justify-center gap-2 text-xs text-red-200 font-medium">
        <Lock className="w-4 h-4 text-red-400 animate-pulse" />
        <span>Chat bloqueado por <strong>{lockedBySellerName}</strong>. No puedes responder simultáneamente a este cliente.</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div id={id} className="p-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200 dark:border-gray-800">
        <VoiceRecorder
          onSendVoice={handleSendVoiceNote}
          onCancel={() => setIsRecording(false)}
        />
      </div>
    );
  }

  return (
    <div
      id={id}
      className="relative flex flex-col bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200 dark:border-gray-800 p-2.5 z-20"
    >
      {/* Replying To Preview Banner */}
      {replyingToMessage && (
        <div className="flex items-center justify-between mb-2 p-2 bg-white dark:bg-[#182229] rounded-lg border-l-4 border-[#00a884] shadow-sm text-xs">
          <div className="min-w-0 pr-2">
            <span className="font-semibold text-[#00a884] block truncate">
              Respondiendo a {replyingToMessage.senderName}
            </span>
            <span className="text-gray-600 dark:text-gray-300 truncate block">
              {replyingToMessage.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-center gap-2 relative">
        <button
          id="btn-emoji-picker"
          type="button"
          onClick={() => {
            setShowEmoji(!showEmoji);
            setShowAttach(false);
          }}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-full transition-colors flex-shrink-0"
        >
          <Smile className="w-5 h-5" />
        </button>
        <EmojiPicker
          isOpen={showEmoji}
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmoji(false)}
        />

        <button
          id="btn-attachment-menu"
          type="button"
          onClick={() => {
            setShowAttach(!showAttach);
            setShowEmoji(false);
            setShowQuickResponses(false);
          }}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-full transition-colors flex-shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <AttachmentMenu
          isOpen={showAttach}
          onClose={() => setShowAttach(false)}
          onSelectType={handleSelectAttachmentType}
        />

        {/* Quick Responses ⚡ Button */}
        <button
          id="btn-quick-responses"
          type="button"
          onClick={() => {
            setShowQuickResponses(!showQuickResponses);
            setShowEmoji(false);
            setShowAttach(false);
          }}
          className={`p-2 rounded-full transition-colors flex-shrink-0 ${
            showQuickResponses
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60'
          }`}
          title="Respuestas Rápidas (Escribe / o presiona ⚡)"
        >
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
        </button>

        {/* Quick Responses Popover Menu */}
        {showQuickResponses && (
          <div className="absolute bottom-14 left-0 w-84 bg-white dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-2.5 z-50 space-y-2">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-100 dark:border-gray-700 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>Respuestas Rápidas ({quickResponses.length})</span>
              </span>
              <div className="flex items-center gap-1.5">
                {!isCreatingQr && (
                  <button
                    onClick={() => setIsCreatingQr(true)}
                    className="px-2 py-0.5 bg-[#00a884] hover:bg-[#008f70] text-white text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                    title="Crear nueva respuesta rápida"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nueva</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowQuickResponses(false);
                    setIsCreatingQr(false);
                  }}
                  className="text-gray-400 hover:text-gray-200 p-0.5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Inline Creation Form */}
            {isCreatingQr ? (
              <form onSubmit={handleSaveNewQr} className="p-2 bg-gray-50 dark:bg-[#111b21] rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-gray-700 dark:text-gray-200 text-[11px]">
                  <span>Nueva Respuesta Rápida</span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingQr(false)}
                    className="text-gray-400 hover:text-gray-200 text-[10px]"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 font-medium">Comando / Atajo</label>
                    <input
                      type="text"
                      placeholder="/pre"
                      value={newShortcut}
                      onChange={(e) => setNewShortcut(e.target.value)}
                      className="w-full px-2 py-1 bg-white dark:bg-[#202c33] border border-gray-300 dark:border-gray-600 rounded text-xs font-mono focus:outline-none focus:border-[#00a884]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-medium">Categoría</label>
                    <input
                      type="text"
                      placeholder="Ventas"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-2 py-1 bg-white dark:bg-[#202c33] border border-gray-300 dark:border-gray-600 rounded text-xs focus:outline-none focus:border-[#00a884]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-medium">
                    Texto o mensaje (Variables: <code className="text-[#00a884]">{"{{nombre_cliente}}"}</code>)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe el mensaje largo aquí..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-[#202c33] border border-gray-300 dark:border-gray-600 rounded text-xs focus:outline-none focus:border-[#00a884] resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingQr(false)}
                    className="px-2.5 py-1 text-[11px] text-gray-400 hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#00a884] hover:bg-[#008f70] text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow"
                  >
                    <Check className="w-3 h-3" />
                    <span>Guardar Respuesta</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pt-0.5">
                {qrCreatedSuccess && (
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-300 text-[11px] rounded text-center font-medium">
                    ¡Respuesta rápida creada con éxito!
                  </div>
                )}

                {filteredQuickResponses.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
                    <span>No hay respuestas con "{text}"</span>
                    <button
                      onClick={() => {
                        setNewShortcut(text.startsWith('/') ? text : `/${text}`);
                        setIsCreatingQr(true);
                      }}
                      className="text-[#00a884] hover:underline font-semibold text-[11px] mt-1"
                    >
                      + Crear "{text}" como comando
                    </button>
                  </div>
                ) : (
                  filteredQuickResponses.map((qr) => (
                    <div
                      key={qr.id}
                      className="group flex items-start justify-between p-2 hover:bg-gray-100 dark:hover:bg-[#2a3942] rounded-lg text-xs transition-colors gap-2 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700/60"
                      onClick={() => handleSelectQuickResponse(qr.text)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between font-mono font-semibold text-[#00a884] mb-0.5">
                          <span className="bg-[#00a884]/10 px-1.5 py-0.5 rounded text-[11px]">
                            {qr.shortcut}
                          </span>
                          {qr.category && (
                            <span className="text-[9px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.2 rounded font-sans font-normal">
                              {qr.category}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-200 line-clamp-2 text-[11px] leading-relaxed">
                          {qr.text}
                        </p>
                      </div>

                      {onDeleteQuickResponse && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Eliminar comando "${qr.shortcut}"?`)) {
                              onDeleteQuickResponse(qr.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all flex-shrink-0"
                          title="Eliminar esta respuesta rápida"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg px-3 py-2 border border-transparent focus-within:border-[#00a884]/40 shadow-inner">
          <input
            id="chat-message-input"
            ref={inputRef}
            type="text"
            placeholder="Escribe un mensaje..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            className="w-full text-xs text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {text.trim() ? (
          <button
            id="btn-send-message"
            onClick={handleSend}
            className="p-2.5 bg-[#00a884] hover:bg-[#008f70] text-white rounded-full shadow-md transition-transform active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="btn-record-voice"
            onClick={() => setIsRecording(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-full transition-colors flex-shrink-0"
            title="Grabar mensaje de voz"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
