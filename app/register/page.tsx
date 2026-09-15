import React from 'react';
import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-40px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="text-sm">RestoQR</span>
        </Link>
      </div>

      {/* Form Content */}
      <div className="my-auto py-10">
        <RegisterForm />
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-zinc-400 dark:text-zinc-600">
        &copy; {new Date().getFullYear()} RestoQR Platform &bull; Multi-Tenant Restaurant QR Menu SaaS
      </div>
    </div>
  );
}
