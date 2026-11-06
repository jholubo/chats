import React, { useEffect, useRef } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownItem[];
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  id?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  onClose,
  items,
  position = 'bottom-right',
  id,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const posClasses = {
    'bottom-right': 'top-full right-0 mt-1',
    'bottom-left': 'top-full left-0 mt-1',
    'top-right': 'bottom-full right-0 mb-1',
    'top-left': 'bottom-full left-0 mb-1',
  };

  return (
    <div
      id={id}
      ref={menuRef}
      className={`absolute z-50 w-52 py-2 bg-white dark:bg-[#233138] rounded-md shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-gray-100 ${posClasses[position]}`}
    >
      {items.map((item) => (
        <button
          key={item.id}
          id={`menu-item-${item.id}`}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 transition-colors ${
            item.danger
              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'hover:bg-gray-100 dark:hover:bg-[#182229]'
          }`}
        >
          {item.icon && <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
