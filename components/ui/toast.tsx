'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastContextType {
  (toast: Omit<Toast, 'id'>): void;
  toast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, type = 'info', duration = 3500 }: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { id, title, description, type, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, description?: string) => addToast({ title, description, type: 'success' }),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) => addToast({ title, description, type: 'error' }),
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) => addToast({ title, description, type: 'info' }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string) => addToast({ title, description, type: 'warning' }),
    [addToast]
  );

  const toastFn = useCallback(
    (opts: Omit<Toast, 'id'>) => addToast(opts),
    [addToast]
  );

  const contextValue = React.useMemo(() => {
    const fn = ((opts: Omit<Toast, 'id'>) => addToast(opts)) as any;
    fn.toast = addToast;
    fn.success = success;
    fn.error = error;
    fn.info = info;
    fn.warning = warning;
    fn.dismiss = dismiss;
    return fn;
  }, [addToast, success, error, info, warning, dismiss]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Floating Toast Viewport */}
      <aside aria-label="Notifications" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full p-4 rounded-2xl shadow-elevated border flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
              t.type === 'success'
                ? 'bg-zinc-900 text-white border-zinc-800 dark:bg-zinc-900 dark:border-zinc-750'
                : t.type === 'error'
                ? 'bg-red-950/95 text-white border-red-800'
                : t.type === 'warning'
                ? 'bg-amber-950/95 text-white border-amber-800'
                : 'bg-zinc-900 text-white border-zinc-800'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-brand-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-extrabold tracking-tight text-white leading-snug">
                {t.title}
              </h4>
              {t.description && (
                <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-zinc-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
