'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Globe,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/auth-service';
import { ServeOSLogo } from '@/components/ui/botanical-decorations';

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRestaurantNameChange = (val: string) => {
    setRestaurantName(val);
    if (!isSlugTouched) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugTouched(true);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !restaurantName || !slug) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.registerOwner({
        name,
        email,
        password,
        restaurantName,
        slug,
        phone,
        address,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-white/95 border border-[#e6e2da] rounded-4xl p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="space-y-2 text-center pb-6 border-b border-[#f0ede6]">
          <div className="flex justify-center mb-2">
            <ServeOSLogo variant="stacked" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[#1b3b2f]">
            Create Your Restaurant Workspace
          </h1>
          <p className="text-xs text-[#556960]">
            Join the new era of serene, botanical hospitality operating systems
          </p>
        </div>

        {error && (
          <div className="p-3.5 mt-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Restaurant Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#1b3b2f] uppercase tracking-wider">
              1. Restaurant Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#162820] mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Rustic Table"
                value={restaurantName}
                onChange={(e) => handleRestaurantNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#162820] mb-1">
                Custom Menu URL Slug *
              </label>
              <div className="flex items-center rounded-2xl border border-[#dcd7ce] bg-[#f4f1eb] px-3 py-2 text-xs font-mono text-[#556960]">
                <span>/r/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="the-rustic-table"
                  className="w-full bg-transparent text-[#1b3b2f] font-bold focus:outline-none pl-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#162820] mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98450 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#162820] mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  placeholder="148 Oak Avenue, Downtown"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Owner Account Details */}
          <div className="space-y-3 pt-4 border-t border-[#f0ede6]">
            <h3 className="text-xs font-bold text-[#1b3b2f] uppercase tracking-wider">
              2. Owner Account
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#162820] mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#162820] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="gladina@rustic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#162820] mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="•••••••• (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl py-3 text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Creating Your ServeOS Space...' : 'Launch ServeOS Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#f0ede6] text-center">
          <p className="text-xs text-[#556960]">
            Already operating on ServeOS?{' '}
            <Link href="/login" className="font-bold text-[#1b3b2f] hover:underline">
              Sign In &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
