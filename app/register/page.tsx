import React from 'react';
import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#eae9e4] antialiased">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <Link href="/" className="flex items-center gap-2 font-bold text-stone-900">
          <div className="w-8 h-8 rounded-xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center shadow-xs">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="text-sm font-black">BitePoint</span>
        </Link>
      </div>

      {/* Form Content */}
      <div className="my-auto py-10">
        <RegisterForm />
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-stone-500 font-medium">
        &copy; {new Date().getFullYear()} BitePoint &bull; Modern Culinary OS
      </div>
    </div>
  );
}
