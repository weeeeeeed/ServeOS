import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SubscriptionStatus, OrderStatus } from '@/lib/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'purple';
  status?: SubscriptionStatus | OrderStatus;
  role?: 'admin' | 'owner';
}

export function Badge({ className, variant = 'default', status, role, children, ...props }: BadgeProps) {
  let effectiveVariant = variant;
  let text = children;

  if (status) {
    switch (status) {
      // Subscriptions
      case 'active':
        effectiveVariant = 'success';
        text = text || 'Active';
        break;
      case 'trialing':
        effectiveVariant = 'info';
        text = text || 'Trialing';
        break;
      case 'past_due':
        effectiveVariant = 'warning';
        text = text || 'Past Due';
        break;
      case 'canceled':
        effectiveVariant = 'danger';
        text = text || 'Canceled';
        break;
      case 'inactive':
        effectiveVariant = 'default';
        text = text || 'Inactive';
        break;

      // Orders
      case 'pending':
        effectiveVariant = 'warning';
        text = text || 'Received';
        break;
      case 'preparing':
        effectiveVariant = 'info';
        text = text || 'Cooking';
        break;
      case 'ready':
        effectiveVariant = 'success';
        text = text || 'Ready 🛎️';
        break;
      case 'completed':
        effectiveVariant = 'success';
        text = text || 'Completed';
        break;
      case 'cancelled':
        effectiveVariant = 'danger';
        text = text || 'Cancelled';
        break;
    }
  }

  if (role) {
    if (role === 'admin') {
      effectiveVariant = 'purple';
      text = text || 'Super Admin';
    } else {
      effectiveVariant = 'info';
      text = text || 'Restaurant Owner';
    }
  }

  const variants = {
    default: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    outline: 'border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
          variants[effectiveVariant],
          className
        )
      )}
      {...props}
    >
      {text}
    </span>
  );
}
