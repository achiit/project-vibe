import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-primary-100 text-primary-800': variant === 'primary',
          'bg-success-100 text-success-800': variant === 'success',
          'bg-warning-100 text-warning-800': variant === 'warning',
          'bg-error-100 text-error-800': variant === 'error',
          'bg-gray-100 text-gray-800': variant === 'gray',
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        }
      )}
    >
      {children}
    </span>
  );
};