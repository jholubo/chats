import React from 'react';
import { Image, FileText, MapPin, Contact, Sticker, Camera, BarChart2 } from 'lucide-react';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'image' | 'document' | 'location' | 'contact' | 'sticker') => void;
  id?: string;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  isOpen,
  onClose,
  onSelectType,
  id,
}) => {
  if (!isOpen) return null;

  const options = [
    {
      id: 'image',
      label: 'Fotos y videos',
      icon: <Image className="w-5 h-5 text-white" />,
      bg: 'bg-purple-500',
      action: () => onSelectType('image'),
    },
    {
      id: 'document',
      label: 'Documento',
      icon: <FileText className="w-5 h-5 text-white" />,
      bg: 'bg-indigo-500',
      action: () => onSelectType('document'),
    },
    {
      id: 'location',
      label: 'Ubicación',
      icon: <MapPin className="w-5 h-5 text-white" />,
      bg: 'bg-emerald-500',
      action: () => onSelectType('location'),
    },
    {
      id: 'contact',
      label: 'Contacto',
      icon: <Contact className="w-5 h-5 text-white" />,
      bg: 'bg-sky-500',
      action: () => onSelectType('contact'),
    },
    {
      id: 'sticker',
      label: 'Sticker',
      icon: <Sticker className="w-5 h-5 text-white" />,
      bg: 'bg-amber-500',
      action: () => onSelectType('sticker'),
    },
  ];

  return (
    <div
      id={id}
      className="absolute bottom-full left-12 mb-3 z-30 flex flex-col gap-2 p-2 bg-white dark:bg-[#233138] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          id={`attach-opt-${opt.id}`}
          onClick={() => {
            opt.action();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#182229] transition-colors"
        >
          <div className={`p-2 rounded-full ${opt.bg} shadow-md`}>{opt.icon}</div>
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
};
