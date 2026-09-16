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
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#faf9f6]/95 backdrop-blur-md antialiased">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-stone-900 group">
          <div className="w-9 h-9 rounded-xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base tracking-tight font-black text-stone-900 leading-none">BitePoint</span>
            <span className="text-[10px] text-stone-500 font-bold tracking-[0.14em] uppercase">Culinary Modernism OS</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-stone-600">
          <Link href="/#modules" className="hover:text-stone-950 transition-colors">
            Platform Modules
          </Link>
          <Link href="/#radar" className="hover:text-stone-950 transition-colors">
            Floor Radar
          </Link>
          <Link href="/r/la-piazza" className="hover:text-stone-950 transition-colors flex items-center gap-1 text-[#1f4e47] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#efa736] animate-pulse" />
            <span>Live Diner QR Demo</span>
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' ? (
                <Link href="/admin">
                  <Button size="sm" className="gap-1.5 bg-[#1f4e47] hover:bg-[#133e36] text-white font-bold rounded-xl shadow-xs">
                    <Shield className="w-3.5 h-3.5 text-[#efa736]" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button size="sm" className="gap-1.5 bg-[#1f4e47] hover:bg-[#133e36] text-white font-bold rounded-xl shadow-xs">
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#efa736]" />
                    <span>Owner Dashboard</span>
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-stone-500 hover:text-stone-900 rounded-xl"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-stone-700 hover:text-stone-950 hover:bg-stone-100 font-semibold rounded-xl text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1.5 shadow-xs bg-[#efa736] hover:bg-[#e09827] text-stone-950 font-bold rounded-xl text-xs">
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
