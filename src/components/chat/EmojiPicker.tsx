import React, { useState } from 'react';

interface EmojiPickerProps {
  isOpen: boolean;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  id?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onSelectEmoji,
  onClose,
  id,
}) => {
  const [activeTab, setActiveTab] = useState<'emojis' | 'stickers'>('emojis');

  if (!isOpen) return null;

  const emojiCategories = [
    {
      title: 'Frecuentes',
      emojis: ['😂', '❤️', '👍', '🔥', '🙏', '😊', '😍', '🎉', '🚀', '💯', '✨', '👏'],
    },
    {
      title: 'Caras y Emociones',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😭', '😗', '😙', '😚', '😘', '🥰', '😍', '🤩', '🥳', '🤗', '🙃', '🙂', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤠'],
    },
    {
      title: 'Gestos y Personas',
      emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜'],
    },
    {
      title: 'Objetos y SaaS',
      emojis: ['💼', '💻', '📱', '📊', '📈', '🚀', '⚡', '💡', '🔒', '🔑', '💬', '📞', '🤖', '🌐'],
    },
  ];

  const stickers = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  ];

  return (
    <div
      id={id}
      className="absolute bottom-full left-4 mb-3 z-30 w-80 h-72 bg-white dark:bg-[#233138] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
    >
      {/* Header Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-[#f0f2f5] dark:bg-[#182229]">
        <button
          onClick={() => setActiveTab('emojis')}
          className={`flex-1 py-2 text-xs font-semibold ${
            activeTab === 'emojis'
              ? 'text-[#00a884] border-b-2 border-[#00a884]'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Emojis
        </button>
        <button
          onClick={() => setActiveTab('stickers')}
          className={`flex-1 py-2 text-xs font-semibold ${
            activeTab === 'stickers'
              ? 'text-[#00a884] border-b-2 border-[#00a884]'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Stickers
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'emojis' ? (
          emojiCategories.map((cat, idx) => (
            <div key={idx}>
              <h5 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {cat.title}
              </h5>
              <div className="grid grid-cols-7 gap-1">
                {cat.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSelectEmoji(emoji);
                    }}
                    className="p-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-transform active:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div>
            <h5 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Stickers de LuboChat
            </h5>
            <div className="grid grid-cols-3 gap-2">
              {stickers.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectEmoji('🎨 [Sticker]');
                    onClose();
                  }}
                  className="cursor-pointer overflow-hidden rounded-lg hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700"
                >
                  <img src={url} alt="Sticker" className="w-full h-16 object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
