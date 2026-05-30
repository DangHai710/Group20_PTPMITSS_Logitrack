// File: src/components/ui/Textarea.tsx
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  rows = 4,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full bg-slate-50 border ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'} px-4 py-3 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-300 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
