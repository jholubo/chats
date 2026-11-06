import React, { useState } from 'react';
import { UserStatusStory } from '../../types';
import { ArrowLeft, Plus, Eye, X } from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface StatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: UserStatusStory[];
  id?: string;
}

export const StatusDrawer: React.FC<StatusDrawerProps> = ({
  isOpen,
  onClose,
  stories,
  id,
}) => {
  const [activeStory, setActiveStory] = useState<UserStatusStory | null>(null);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      className="absolute inset-y-0 left-0 z-40 w-full sm:w-96 bg-[#f0f2f5] dark:bg-[#111b21] flex flex-col shadow-2xl transition-transform duration-300"
    >
      {/* Header */}
      <div className="flex items-end h-28 p-4 bg-[#008069] dark:bg-[#202c33] text-white gap-6">
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors mb-0.5">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-semibold mb-0.5">Estados / Stories</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* My Status Card */}
        <div
          onClick={() => alert('Añadir nuevo estado en LuboChat')}
          className="flex items-center gap-3 p-3 bg-white dark:bg-[#202c33] rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229]"
        >
          <div className="relative">
            <Avatar
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
              alt="Mi estado"
              size="md"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#00a884] text-white p-0.5 rounded-full border-2 border-white dark:border-gray-900">
              <Plus className="w-3 h-3" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Mi estado</h3>
            <p className="text-[11px] text-gray-400">Toca para añadir una actualización</p>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
            Recientes
          </h4>
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="flex items-center gap-3 p-3 bg-white dark:bg-[#202c33] rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors"
            >
              <Avatar
                src={story.userAvatar}
                alt={story.userName}
                size="md"
                hasStory={true}
                storyViewed={story.isViewed}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {story.userName}
                </h3>
                <p className="text-[11px] text-gray-400">{story.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Story Lightbox */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-4">
          <div className="w-full max-w-sm flex items-center justify-between text-white z-10 pt-2">
            <div className="flex items-center gap-2">
              <Avatar src={activeStory.userAvatar} alt={activeStory.userName} size="sm" />
              <span className="text-xs font-semibold">{activeStory.userName}</span>
            </div>
            <button onClick={() => setActiveStory(null)} className="p-2 text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative my-auto max-w-sm w-full h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 flex items-center justify-center">
            <img
              src={activeStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {activeStory.caption && (
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-xs text-center font-medium">
                {activeStory.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
