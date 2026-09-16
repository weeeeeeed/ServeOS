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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/auth-service';

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

  // Auto-derive slug from restaurant name if not manually edited
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
      <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 shadow-board">
        {/* Header */}
        <div className="space-y-2 text-center pb-6 border-b border-stone-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f4e47] text-[#efa736] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>14-Day Free Pro Trial Included</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Create Restaurant Account
          </h1>
          <p className="text-xs text-stone-500">
            Set up your digital QR menu in under 2 minutes
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {/* Owner Details Section */}
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400 mb-3">
              1. Owner Credentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Your Full Name *"
                type="text"
                placeholder="Marco Rossi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
                className="bg-[#faf9f6] border-stone-200 focus:border-[#efa736] focus:ring-[#efa736]/20 rounded-xl"
              />

              <Input
                label="Work Email *"
                type="email"
                placeholder="marco@trattoria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                className="bg-[#faf9f6] border-stone-200 focus:border-[#efa736] focus:ring-[#efa736]/20 rounded-xl"
              />
            </div>

            <div className="mt-3">
              <Input
                label="Password *"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                className="bg-[#faf9f6] border-stone-200 focus:border-[#efa736] focus:ring-[#efa736]/20 rounded-xl"
              />
            </div>
          </div>

          {/* Restaurant Details Section */}
          <div className="pt-4 border-t border-stone-100">
            <h2 className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400 mb-3">
              2. Restaurant Information
            </h2>

            <div className="space-y-3">
              <Input
                label="Restaurant Name *"
                type="text"
                placeholder="La Piazza Trattoria"
                value={restaurantName}
                onChange={(e) => handleRestaurantNameChange(e.target.value)}
                leftIcon={<Store className="w-4 h-4" />}
                required
                className="bg-[#faf9f6] border-stone-200 focus:border-[#efa736] focus:ring-[#efa736]/20 rounded-xl"
              />

              <div>
                <Input
                  label="Menu URL Slug *"
                  type="text"
                  placeholder="la-piazza"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  leftIcon={<Globe className="w-4 h-4" />}
                  helperText={slug ? `Customer QR URL: /${slug}` : 'Unique handle for your restaurant menu'}
                  required
                  className="bg-[#faf9f6] border-stone-200 focus:border-[#efa736] focus:ring-[#efa736]/20 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Phone"
                  type="tel"
                  placeholder="+1 (555) 019-2831"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                  className="bg-[#faf9f6] border-stone-200 focus:border-[#efa736] focus:ring-[#efa736]/20 rounded-xl"
                />

                <Input
                  label="Physical Address"
                  type="text"
                  placeholder="142 Via Della Spiga, NY"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  className="bg-[#faf9f6] border-stone-200 focus:border-[#efa736] focus:ring-[#efa736]/20 rounded-xl"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-[#efa736] hover:bg-[#e09827] text-stone-950 font-bold rounded-xl h-12 shadow-sm"
            size="lg"
            isLoading={isLoading}
          >
            <span>Complete Registration</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-stone-500 pt-4 border-t border-stone-100">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-stone-900 hover:text-[#1f4e47] underline underline-offset-2"
          >
            Sign in to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
