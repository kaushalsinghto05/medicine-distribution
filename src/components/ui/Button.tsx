import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'hazard' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1A504C] focus-visible:ring-offset-1 select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2 min-h-[40px]',
    lg: 'px-6 py-2.5 text-sm sm:text-base gap-2.5 min-h-[46px]',
  };

  const variantClasses = {
    primary: 'bg-[#1A504C] hover:bg-[#143F3C] text-white shadow-none border border-[#1A504C]',
    secondary: 'bg-[#F5F8F6] hover:bg-[#E8F3F1] text-[#1A1A1A] border border-gray-200',
    outline: 'bg-white hover:bg-[#F5F8F6] text-[#1A1A1A] border border-gray-300 shadow-none',
    ghost: 'bg-transparent hover:bg-[#F5F8F6] text-[#6B7280] hover:text-[#1A1A1A]',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300',
    hazard: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-none border border-emerald-600',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
