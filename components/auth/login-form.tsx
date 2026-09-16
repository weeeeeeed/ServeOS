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
      <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 shadow-board">
        <div className="space-y-2 text-center pb-6 border-b border-stone-100">
          <div className="w-10 h-10 rounded-2xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center mx-auto shadow-xs mb-3">
            <Store className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Welcome Back
          </h1>
          <p className="text-xs text-stone-500">
            Sign in to manage your restaurant or access the platform admin
          </p>
        </div>

        {/* Quick Demo Role Fillers */}
        <div className="my-5">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.16em] mb-2.5">
            Quick 1-Click Role Switcher
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
                      ? 'border-[#1f4e47] bg-[#1f4e47] text-white shadow-xs'
                      : 'border-stone-200 bg-[#faf9f6] hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {acc.role === 'admin' ? (
                      <Shield className={`w-3.5 h-3.5 ${isSelected ? 'text-[#efa736]' : 'text-stone-600'}`} />
                    ) : (
                      <Store className={`w-3.5 h-3.5 ${isSelected ? 'text-[#efa736]' : 'text-[#2f6858]'}`} />
                    )}
                    <span>{acc.role === 'admin' ? 'Super Admin' : 'Owner'}</span>
                  </div>
                  <span className={`text-[11px] mt-0.5 truncate ${
                    isSelected ? 'text-emerald-200' : 'text-stone-400'
                  }`}>
                    {acc.email}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
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
            className="bg-[#faf9f6] border-stone-200 focus:border-[#efa736] focus:ring-[#efa736]/20 rounded-xl"
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
            className="bg-[#faf9f6] border-stone-200 focus:border-[#efa736] focus:ring-[#efa736]/20 rounded-xl"
          />

          <Button
            type="submit"
            className="w-full mt-2 bg-[#efa736] hover:bg-[#e09827] text-stone-950 font-bold rounded-xl h-12 shadow-sm"
            size="lg"
            isLoading={isLoading}
          >
            <span>Sign In to BitePoint</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-stone-500 pt-4 border-t border-stone-100">
          New dining establishment?{' '}
          <Link
            href="/register"
            className="font-bold text-stone-900 hover:text-[#1f4e47] underline underline-offset-2"
          >
            Register restaurant account
          </Link>
        </div>
      </div>
    </div>
  );
}
