'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, ArrowRight, Shield, Store, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/auth-service';
import { DEMO_ACCOUNTS } from '@/lib/mock-data';
import { ServeOSLogo } from '@/components/ui/botanical-decorations';

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
      ? 'Admin authorization required. Please sign in as Super Admin.'
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
      <div className="bg-white/95 border border-[#e6e2da] rounded-4xl p-6 sm:p-8 shadow-xs">
        <div className="space-y-2 text-center pb-6 border-b border-[#f0ede6]">
          <div className="flex justify-center mb-2">
            <ServeOSLogo variant="stacked" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[#1b3b2f]">
            Welcome Back
          </h1>
          <p className="text-xs text-[#556960]">
            Sign in to your restaurant workspace or platform portal
          </p>
        </div>

        {/* Quick Demo Role Fillers */}
        <div className="my-5">
          <p className="text-[10px] font-bold text-[#85988e] uppercase tracking-wider mb-2">
            Quick 1-Click Role Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = email === acc.email;
              return (
                <button
                  type="button"
                  key={acc.role}
                  onClick={() => handleQuickDemoLogin(acc.email, acc.password)}
                  className={`flex flex-col text-left p-3 rounded-2xl border text-xs transition-all ${
                    isSelected
                      ? 'border-[#1b3b2f] bg-[#1b3b2f] text-white shadow-xs'
                      : 'border-[#e6e2da] bg-[#faf8f5] hover:border-[#c5beb2] text-[#162820]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold font-serif">
                    {acc.role === 'admin' ? (
                      <Shield className={`w-3.5 h-3.5 ${isSelected ? 'text-[#eef4f0]' : 'text-[#3a7d5c]'}`} />
                    ) : (
                      <Store className={`w-3.5 h-3.5 ${isSelected ? 'text-[#eef4f0]' : 'text-[#3a7d5c]'}`} />
                    )}
                    <span>{acc.role === 'admin' ? 'Super Admin' : 'Restaurant Owner'}</span>
                  </div>
                  <span className={`text-[10px] truncate mt-0.5 font-sans ${isSelected ? 'text-[#d2ded6]' : 'text-[#85988e]'}`}>
                    {acc.email}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-[#1b3b2f] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e]" />
              <input
                type="email"
                required
                placeholder="name@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] text-[#162820] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d5c]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#1b3b2f] uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] text-[#162820] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d5c]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl py-2.5 text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to ServeOS'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#f0ede6] text-center">
          <p className="text-xs text-[#556960]">
            Don&apos;t have a restaurant workspace yet?{' '}
            <Link href="/register" className="font-bold text-[#1b3b2f] hover:underline">
              Create Restaurant &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
