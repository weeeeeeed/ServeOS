'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QrCode, ArrowRight, LayoutDashboard, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/auth-service';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

import { ServeOSLogo } from '@/components/ui/botanical-decorations';

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
    <header className="sticky top-0 z-40 w-full border-b border-[#e6ede7] bg-[#faf8f5]/95 backdrop-blur-md antialiased transition-all">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group">
          <ServeOSLogo className="h-8" textClassName="text-xl" />
        </Link>

        {/* Navigation Links - Matching Reference Image */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#526359]">
          <Link href="/#features" className="hover:text-[#1b3b2f] transition-colors">
            Product
          </Link>
          <Link href="/#solutions" className="hover:text-[#1b3b2f] transition-colors">
            Solutions
          </Link>
          <Link href="/#pricing" className="hover:text-[#1b3b2f] transition-colors">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-[#1b3b2f] transition-colors">
            Resources
          </Link>
          <Link href="/r/la-piazza" className="hover:text-[#1b3b2f] transition-colors flex items-center gap-1.5 text-[#2d6a4f] font-bold bg-[#eef4f0] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f] animate-pulse" />
            <span>Diner QR Menu</span>
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' ? (
                <Link href="/admin">
                  <Button size="sm" className="gap-1.5 bg-[#1b3b2f] hover:bg-[#153026] text-white font-semibold rounded-full shadow-xs text-xs px-4">
                    <Shield className="w-3.5 h-3.5 text-[#8fbc8f]" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button size="sm" className="gap-1.5 bg-[#1b3b2f] hover:bg-[#153026] text-white font-semibold rounded-full shadow-xs text-xs px-4">
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#8fbc8f]" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[#6b7c72] hover:text-[#162820] hover:bg-[#eef4f0] rounded-full"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#3d5045] hover:text-[#162820] px-3.5 py-2 transition-colors"
                >
                  Log in
                </button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#1b3b2f] hover:bg-[#153026] text-white font-semibold rounded-full text-xs px-5 shadow-sm">
                  Start Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
