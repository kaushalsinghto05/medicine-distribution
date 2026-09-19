import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  badge?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isInvalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  badge,
  leftIcon,
  rightIcon,
  isInvalid,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const hasError = isInvalid || Boolean(error);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
          {badge && (
            <span className="text-[10px] font-medium text-slate-400">{badge}</span>
          )}
        </div>
      )}

      <div className="relative rounded-xl transition-all duration-150">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl text-xs sm:text-sm font-medium bg-white border transition-colors duration-150 min-h-[42px] px-3.5 py-2 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-9' : ''
          } ${rightIcon ? 'pr-9' : ''} ${
            hasError
              ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-200 text-slate-900 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>

      {hasError ? (
        <p className="text-[11px] font-medium text-rose-600 transition-all flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
