import React, { useState } from 'react';
import { Message } from '../../types';
import { AudioMessage } from './AudioMessage';
import { FileMessage } from './FileMessage';
import { ImageMessage } from './ImageMessage';
import { LocationMessage } from './LocationMessage';
import { Check, CheckCheck, Star, ChevronDown, Smile, Reply } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onReply?: (msg: Message) => void;
  onStar?: (msgId: string) => void;
  onReact?: (msgId: string, emoji: string) => void;
  onDelete?: (msgId: string) => void;
  id?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onReply,
  onStar,
  onReact,
  onDelete,
  id,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { fromMe, type, content, media, location, timestamp, status, replyTo, isStarred, reactions } = message;

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  if (type === 'system') {
    return (
      <div id={id} className="flex justify-center my-2.5 w-full select-none">
        <div className="bg-[#182229]/95 text-amber-200/90 text-[11px] px-3.5 py-1.5 rounded-lg border border-amber-500/20 text-center font-medium shadow-sm max-w-md flex items-center gap-1.5">
          <span>ℹ️</span>
          <span>{content}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowEmojiPicker(false);
      }}
      className={`group relative flex flex-col my-1 max-w-[85%] sm:max-w-[70%] ${
        fromMe ? 'ml-auto items-end' : 'mr-auto items-start'
      }`}
    >
      {/* Reaction Bar Popup */}
      {showEmojiPicker && (
        <div className={`absolute -top-8 z-20 flex items-center gap-1 p-1 bg-white dark:bg-[#233138] rounded-full shadow-md border border-gray-200 dark:border-gray-700 ${
          fromMe ? 'right-0' : 'left-0'
        }`}>
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact?.(message.id, emoji);
                setShowEmojiPicker(false);
              }}
              className="p-1 text-sm hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Bubble Card */}
      <div
        className={`relative px-3 py-2 rounded-lg text-sm shadow-sm select-text ${
          fromMe
            ? 'bg-[#d9fdd3] text-gray-900 dark:bg-[#005c4b] dark:text-gray-100 rounded-tr-none'
            : 'bg-white text-gray-900 dark:bg-[#202c33] dark:text-gray-100 rounded-tl-none'
        }`}
      >
        {/* Context Menu Trigger */}
        {showActions && (
          <div className={`absolute top-1 ${fromMe ? 'left-1' : 'right-1'} z-10 flex items-center gap-0.5 opacity-80 hover:opacity-100`}>
            <button
              title="Reaccionar"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-black/5 dark:bg-white/5 rounded"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            <button
              title="Responder"
              onClick={() => onReply?.(message)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-black/5 dark:bg-white/5 rounded"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Reply To Preview */}
        {replyTo && (
          <div className="mb-1.5 p-1.5 rounded border-l-4 border-[#00a884] bg-black/5 dark:bg-white/5 text-xs">
            <span className="font-semibold text-[#00a884] block">{replyTo.senderName}</span>
            <span className="text-gray-600 dark:text-gray-300 line-clamp-1">{replyTo.content}</span>
          </div>
        )}

        {/* Message Content Body */}
        {type === 'text' && (
          <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
        )}

        {type === 'audio' && (
          <AudioMessage
            url={media?.url}
            duration={media?.duration}
            fromMe={fromMe}
            senderAvatar={message.senderAvatar}
          />
        )}

        {type === 'image' && <ImageMessage media={media} caption={content} />}

        {type === 'document' && <FileMessage media={media} fromMe={fromMe} />}

        {type === 'location' && <LocationMessage location={location} />}

        {/* Timestamp and Delivery Checks */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
          {isStarred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
          <span>{timestamp}</span>
          {fromMe && (
            <span className="ml-0.5">
              {status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
              ) : status === 'delivered' ? (
                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <Check className="w-3.5 h-3.5 text-gray-400" />
              )}
            </span>
          )}
        </div>

        {/* Reaction badges on bubble footer */}
        {reactions && reactions.length > 0 && (
          <div className="absolute -bottom-2.5 right-2 flex items-center bg-white dark:bg-[#233138] px-1.5 py-0.5 rounded-full shadow border border-gray-200 dark:border-gray-700 text-xs">
            {reactions.map((r, i) => (
              <span key={i}>{r.emoji}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
