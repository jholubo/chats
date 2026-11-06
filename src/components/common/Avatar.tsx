import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  hasStory?: boolean;
  storyViewed?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  isOnline,
  hasStory,
  storyViewed,
  onClick,
  className = '',
  id,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const ringClass = hasStory
    ? storyViewed
      ? 'p-0.5 ring-2 ring-gray-400'
      : 'p-0.5 ring-2 ring-emerald-500'
    : '';

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative inline-block flex-shrink-0 cursor-pointer ${className}`}
    >
      <div className={`rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ${sizeClasses[size]} ${ringClass}`}>
        <img
          src={src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
          alt={alt}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
      )}
    </div>
  );
};
