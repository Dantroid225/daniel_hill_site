import React from 'react';
import { classNames } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={classNames(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-border focus:border-primary',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-muted-foreground text-sm">{helperText}</p>
      )}
    </div>
  );
};

export default Input; 