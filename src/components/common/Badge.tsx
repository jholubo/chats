import React from 'react';

interface BadgeProps {
  count?: number;
  label?: string;
  variant?: 'emerald' | 'gray' | 'sky';
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({ count, label, variant = 'emerald', id }) => {
  if (count === 0 && !label) return null;

  const bgClasses = {
    emerald: 'bg-[#25D366] text-white font-medium',
    gray: 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    sky: 'bg-sky-500 text-white',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs rounded-full ${bgClasses[variant]}`}
    >
      {count !== undefined ? (count > 99 ? '99+' : count) : label}
    </span>
  );
};
