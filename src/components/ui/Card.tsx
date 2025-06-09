import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  padding = 'md',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        {
          'card-hover': hoverable,
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
          'cursor-pointer': onClick !== undefined,
        },
        className
      )}
    >
      {children}
    </div>
  );
};