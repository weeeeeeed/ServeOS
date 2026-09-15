'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, ArrowRight, Shield, Store, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/auth-service';
import { DEMO_ACCOUNTS } from '@/lib/mock-data';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const reasonParam = searchParams.get('reason');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    reasonParam === 'admin_required'
      ? 'Admin authorization required. Please sign in as a Super Admin.'
      : reasonParam === 'auth_required'
      ? 'Please sign in to access your dashboard.'
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user } = await AuthService.login(email, password);

      // Role-based redirection
      if (user.role === 'admin') {
        router.push(redirectParam && redirectParam.startsWith('/admin') ? redirectParam : '/admin');
      } else {
        router.push(redirectParam && redirectParam.startsWith('/dashboard') ? redirectParam : '/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Card Wrapper */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-card">
        <div className="space-y-2 text-center pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to manage your restaurant or admin portal
          </p>
        </div>

        {/* Quick Demo Role Fillers */}
        <div className="my-5">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
            Quick 1-Click Role Switcher
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                type="button"
                key={acc.role}
                onClick={() => handleQuickDemoLogin(acc.email, acc.password)}
                className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition-all ${
                  email === acc.email
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {acc.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-purple-500" />
                  ) : (
                    <Store className="w-3.5 h-3.5 text-brand-500" />
                  )}
                  <span>{acc.role === 'admin' ? 'Super Admin' : 'Owner'}</span>
                </div>
                <span className={`text-[11px] mt-0.5 truncate ${
                  email === acc.email ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'
                }`}>
                  {acc.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@restaurant.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={isLoading}
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          New restaurant owner?{' '}
          <Link
            href="/register"
            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-2"
          >
            Create an owner account
          </Link>
        </div>
      </div>
    </div>
  );
}
