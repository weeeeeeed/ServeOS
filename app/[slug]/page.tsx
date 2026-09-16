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
    <div className="min-h-screen bg-[#eae9e4] p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-4 bg-white p-6 rounded-[32px] border border-stone-200 shadow-board text-center">
        <Skeleton className="h-16 w-16 rounded-2xl mx-auto bg-stone-200" />
        <Skeleton className="h-6 w-48 mx-auto bg-stone-200" />
        <Skeleton className="h-4 w-64 mx-auto bg-stone-100" />
        <p className="text-xs text-stone-500 font-medium pt-2">
          Loading BitePoint Dining Menu...
        </p>
      </div>
    </div>
  );
}
