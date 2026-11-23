import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] transition-transform duration-150';

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
      secondary: 'bg-navy-900 text-white hover:bg-navy-800 shadow-sm',
      outline: 'border border-surface-border bg-white text-navy-800 hover:bg-surface-hover hover:border-slate-300 shadow-sm',
      ghost: 'text-navy-700 hover:bg-slate-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500',
    };

    const sizes = {
      sm: 'text-xs h-8 px-2.5 gap-1.5',
      md: 'text-sm h-10 px-4 gap-2',
      lg: 'text-base h-12 px-6 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
