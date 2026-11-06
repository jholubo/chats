import React from 'react';
import { FileText, Download } from 'lucide-react';
import { MediaMeta } from '../../types';

interface FileMessageProps {
  media?: MediaMeta;
  fromMe: boolean;
  id?: string;
}

export const FileMessage: React.FC<FileMessageProps> = ({ media, fromMe, id }) => {
  const fileName = media?.fileName || 'documento_adjunto.pdf';
  const fileSize = media?.fileSize || '2.4 MB';

  return (
    <div
      id={id}
      className={`flex items-center gap-3 p-3 rounded-lg border min-w-[220px] max-w-xs ${
        fromMe
          ? 'bg-[#d9fdd3]/80 border-emerald-200/50 dark:bg-[#005c4b]/50 dark:border-emerald-700/30'
          : 'bg-gray-100/90 border-gray-200 dark:bg-[#202c33]/90 dark:border-gray-700/50'
      }`}
    >
      <div className="p-3 bg-red-500/10 text-red-500 rounded-lg flex-shrink-0">
        <FileText className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
          {fileName}
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
          {fileSize} • PDF
        </p>
      </div>
      <button
        onClick={() => alert(`Descargando ${fileName}...`)}
        className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
};
