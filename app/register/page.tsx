'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RegisterForm } from '@/components/auth/register-form';
import { ServeOSLogo } from '@/components/ui/botanical-decorations';

export default function RegisterPage() {
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

      {/* Form Content */}
      <div className="my-auto py-8 relative z-10">
        <RegisterForm />
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-[#85988e] font-sans relative z-10">
        &copy; {new Date().getFullYear()} ServeOS &bull; Handcrafted Restaurant Operating System
      </div>
    </div>
  );
}
