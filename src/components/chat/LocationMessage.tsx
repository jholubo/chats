import React, { useState } from 'react';
import { LocationData } from '../../types';
import { MapPin, ExternalLink, Copy, Check } from 'lucide-react';

interface LocationMessageProps {
  location?: LocationData;
  id?: string;
}

export const LocationMessage: React.FC<LocationMessageProps> = ({ location, id }) => {
  const [copied, setCopied] = useState(false);

  const locName = location?.name || 'Ubicación compartida';
  const locAddress = location?.address || 'Ver en mapas de Google';
  const mapsUrl = location
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : '#';

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(mapsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={id}
      className="rounded-lg overflow-hidden border border-emerald-500/20 max-w-xs bg-white dark:bg-[#202c33]"
    >
      <div className="relative h-32 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden">
        {/* Abstract Map Background Graphic */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#00a884_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-3 bg-[#00a884] text-white rounded-full shadow-lg animate-bounce">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="p-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
          {locName}
        </h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {locAddress}
        </p>

        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-[#00a884] flex items-center gap-1 hover:underline"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={handleCopyLink}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 text-gray-700 dark:text-gray-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
            title="Copiar enlace de ubicación"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-gray-400" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
