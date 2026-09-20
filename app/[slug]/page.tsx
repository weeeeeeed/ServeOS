'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerRestaurantRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      router.replace(`/r/${slug}`);
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-[#f4efe8] p-4 sm:p-8 flex flex-col items-center justify-center font-sans antialiased">
      <div className="max-w-md w-full space-y-4 bg-[#faf8f5] p-8 rounded-[36px] border border-[#e6e2da] shadow-xs text-center">
        <img
          src="/images/serveos-icon.png"
          alt="ServeOS"
          className="h-12 w-auto mx-auto object-contain animate-pulse"
        />
        <p className="text-xs text-[#556960] font-medium pt-2">
          Opening ServeOS Dining Menu...
        </p>
      </div>
    </div>
  );
}
