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
      // Warm Amber primary button from BitePoint design system
      primary:
        'bg-[#efa736] text-[#1c1917] hover:bg-[#e09827] active:bg-[#d99322] focus-visible:ring-[#efa736] shadow-sm font-bold',
      // Forest Emerald secondary button from BitePoint design system
      secondary:
        'bg-[#1f4e47] text-white hover:bg-[#153833] active:bg-[#0f2925] focus-visible:ring-[#1f4e47] shadow-sm',
      // Delicate hairline outline button
      outline:
        'border border-stone-200/80 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 shadow-xs',
      ghost:
        'bg-transparent hover:bg-stone-100 active:bg-stone-200 text-stone-700',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600 shadow-xs',
      subtle:
        'bg-[#fff6e5] text-[#825500] hover:bg-[#ffedcc] active:bg-[#ffe5b3]',
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
