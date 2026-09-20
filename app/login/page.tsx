'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { Skeleton } from '@/components/ui/skeleton';
import { ServeOSLogo } from '@/components/ui/botanical-decorations';

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/95 rounded-4xl border border-[#e6e2da] shadow-xs space-y-4">
      <Skeleton className="h-8 w-40 mx-auto bg-[#e6e2da]" />
      <Skeleton className="h-4 w-60 mx-auto bg-[#ebe7df]" />
      <Skeleton className="h-10 w-full mt-6 bg-[#ebe7df]" />
      <Skeleton className="h-10 w-full bg-[#ebe7df]" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#f4f1eb] antialiased text-[#162820] relative overflow-hidden">
      {/* Natural sunlit leaf shadows & realistic foliage */}
      
      
      <div className="hidden sm:block absolute -bottom-4 -left-4 pointer-events-none select-none z-10">
        
      </div>

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#556960] hover:text-[#1b3b2f] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ServeOS Home</span>
        </Link>

        <Link href="/" className="flex items-center">
          <ServeOSLogo size="sm" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="my-auto py-8 relative z-10">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-[#85988e] font-sans relative z-10">
        &copy; {new Date().getFullYear()} ServeOS &bull; Handcrafted Restaurant Operating System
      </div>
    </div>
  );
}
