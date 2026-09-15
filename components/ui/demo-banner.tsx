'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Database, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import Link from 'next/link';

export function DemoBanner() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
  }, []);

  if (dismissed || configured === null) return null;

  return (
    <aside aria-label="System Mode" className={`border-b text-xs transition-all ${
      configured 
        ? 'bg-emerald-50/70 border-emerald-200/60 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300' 
        : 'bg-zinc-900 text-zinc-200 border-zinc-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {configured ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Supabase Connected:</strong> Production Database & Auth Active
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>
                <strong>Interactive Demo Active:</strong> Using built-in store. Plug in Supabase keys in <code className="bg-zinc-800 text-zinc-100 px-1 py-0.5 rounded text-[11px]">.env.local</code> to activate production Supabase auth.
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="font-medium underline underline-offset-2 hover:text-white inline-flex items-center gap-1"
          >
            Quick Login Demo <ChevronRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
