import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#eae9e4] p-4 sm:p-6 lg:p-8 flex flex-col justify-between items-center antialiased">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-stone-900">
          <div className="w-8 h-8 rounded-xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="text-sm font-black">BitePoint</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Board */}
      <div className="my-auto max-w-md w-full bg-white border border-stone-200 rounded-[32px] p-8 sm:p-10 shadow-board text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-[#efa736] flex items-center justify-center mx-auto border border-amber-200/60 shadow-xs">
          <UtensilsCrossed className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1f4e47] px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 inline-block">
            404 &bull; Page Not Found
          </span>
          <h1 className="text-2xl font-black tracking-tight text-stone-900">
            Table Not Reserved
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            The dining menu, establishment, or platform route you requested does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-[#efa736] hover:bg-[#e09827] text-stone-950 font-bold rounded-xl h-11 px-6 shadow-sm gap-2">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link href="/r/la-piazza">
            <Button variant="outline" className="w-full sm:w-auto border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl h-11 px-5">
              <span>View Demo Menu</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-stone-500 font-medium">
        &copy; {new Date().getFullYear()} BitePoint &bull; Modern Culinary OS
      </div>
    </div>
  );
}
