'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QrCode, ArrowRight, LayoutDashboard, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/auth-service';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = AuthService.getCurrentSession();
    setUser(session.user);
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-zinc-900 dark:text-zinc-50 group">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base tracking-tight font-bold leading-none">RestoQR</span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">Multi-Tenant SaaS</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/#features" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
            Features
          </Link>
          <Link href="/#architecture" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
            Architecture
          </Link>
          <Link href="/r/la-piazza" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
            Live QR Demo
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' ? (
                <Link href="/admin">
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    Admin Panel
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Owner Dashboard
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="gap-1.5 shadow-sm">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
