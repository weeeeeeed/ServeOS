import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServeOSLogo } from '@/components/ui/botanical-decorations';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f4efe8] p-4 sm:p-6 lg:p-8 flex flex-col justify-between items-center antialiased font-sans text-[#162820]">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <ServeOSLogo size="sm" />
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#556960] hover:text-[#1b3b2f] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ServeOS Home</span>
        </Link>
      </div>

      {/* Main Board */}
      <div className="my-auto max-w-md w-full bg-[#faf8f5] border border-[#e6e2da] rounded-4xl p-8 sm:p-10 shadow-xs text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center mx-auto border border-[#d2ded6] shadow-2xs">
          <ServeOSLogo size="md" variant="icon-only" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b3b2f] px-3 py-1 rounded-full bg-[#eef4f0] border border-[#d2ded6] inline-block font-sans">
            404 &bull; Page Not Found
          </span>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[#1b3b2f]">
            Table Not Reserved
          </h1>
          <p className="text-xs text-[#556960] leading-relaxed max-w-sm mx-auto font-sans">
            The dining menu, establishment, or platform route you requested does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-[#1b3b2f] hover:bg-[#153026] text-white font-semibold rounded-2xl h-11 px-6 shadow-sm gap-2 text-xs">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link href="/r/la-piazza">
            <Button variant="outline" className="w-full sm:w-auto border-[#e6e2da] text-[#162820] hover:bg-white rounded-2xl h-11 px-5 text-xs font-semibold">
              <span>View Demo Menu</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-[#85988e] font-sans">
        &copy; {new Date().getFullYear()} ServeOS &bull; Handcrafted Restaurant Operating System
      </div>
    </div>
  );
}
