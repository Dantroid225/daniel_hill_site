import React from 'react';
import { classNames } from '@/utils';

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  rows = 4,
  ...props
}) => {
  const textareaId =
    id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className='space-y-2'>
      {label && (
        <label
          htmlFor={textareaId}
          className='block text-sm font-medium text-foreground'
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={classNames(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none text-foreground bg-background',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-border focus:border-primary',
          className
        )}
        {...props}
      />
      {error && <p className='text-red-500 text-sm'>{error}</p>}
      {helperText && !error && (
        <p className='text-muted-foreground text-sm'>{helperText}</p>
      )}
    </div>
  );
};

export default TextArea;
