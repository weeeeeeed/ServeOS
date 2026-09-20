import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-2xl active:scale-[0.98]';

    const variants = {
      // Forest Green primary button from ServeOS botanical system
      primary:
        'bg-[#1b3b2f] text-white hover:bg-[#153026] active:bg-[#0f241c] focus-visible:ring-[#1b3b2f] shadow-sm font-semibold',
      // Sage Green soft pill secondary button
      secondary:
        'bg-[#eef4f0] text-[#1b3b2f] hover:bg-[#e2ede6] active:bg-[#d5e4db] focus-visible:ring-[#3a7d5c] font-medium',
      // Delicate hairline outline button
      outline:
        'border border-[#dce7e1] bg-white hover:bg-[#f7faf8] active:bg-[#eef4f0] text-[#162820] shadow-xs',
      ghost:
        'bg-transparent hover:bg-[#eef4f0] active:bg-[#e2ede6] text-[#162820]',
      destructive:
        'bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 focus-visible:ring-rose-600 shadow-xs',
      subtle:
        'bg-[#fbf4eb] text-[#a36034] hover:bg-[#f5e9da] active:bg-[#ede0ce]',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      md: 'h-10 px-4 text-xs sm:text-sm gap-2',
      lg: 'h-11 px-6 text-sm sm:text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
