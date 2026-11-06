import React, { useState } from 'react';
import { MediaMeta } from '../../types';
import { Maximize2, X } from 'lucide-react';

interface ImageMessageProps {
  media?: MediaMeta;
  caption?: string;
  id?: string;
}

export const ImageMessage: React.FC<ImageMessageProps> = ({ media, caption, id }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imageUrl = media?.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';

  return (
    <div id={id} className="relative rounded-lg overflow-hidden max-w-xs group">
      <div
        onClick={() => setLightboxOpen(true)}
        className="relative cursor-pointer overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800"
      >
        <img
          src={imageUrl}
          alt={caption || 'WhatsApp Image'}
          className="w-full max-h-72 object-cover transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
        </div>
      </div>

      {caption && (
        <p className="text-xs text-gray-800 dark:text-gray-100 mt-1.5 px-1">
          {caption}
        </p>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={imageUrl}
            alt="Expanded view"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            referrerPolicy="no-referrer"
          />
          {caption && <p className="text-white text-sm mt-4">{caption}</p>}
        </div>
      )}
    </div>
  );
};
