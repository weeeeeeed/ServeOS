'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Globe,
  Clock,
  FileText,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthService } from '@/lib/auth-service';
import { MenuService } from '@/lib/menu-service';
import { Restaurant } from '@/lib/types';

interface RestaurantProfileCardProps {
  initialRestaurant: Restaurant | null;
  onUpdate?: (updated: Restaurant) => void;
}

export function RestaurantProfileCard({ initialRestaurant, onUpdate }: RestaurantProfileCardProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(initialRestaurant);
  const [name, setName] = useState(initialRestaurant?.name || '');
  const [slug, setSlug] = useState(initialRestaurant?.slug || '');
  const [phone, setPhone] = useState(initialRestaurant?.phone || '');
  const [address, setAddress] = useState(initialRestaurant?.address || '');
  const [openingHours, setOpeningHours] = useState(initialRestaurant?.opening_hours || 'Mon - Sun: 10:00 AM - 10:00 PM');
  const [description, setDescription] = useState(initialRestaurant?.description || '');
  const [logo, setLogo] = useState(initialRestaurant?.logo || '');

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialRestaurant) {
      setRestaurant(initialRestaurant);
      setName(initialRestaurant.name);
      setSlug(initialRestaurant.slug);
      setPhone(initialRestaurant.phone || '');
      setAddress(initialRestaurant.address || '');
      setOpeningHours(initialRestaurant.opening_hours || 'Mon - Sun: 10:00 AM - 10:00 PM');
      setDescription(initialRestaurant.description || '');
      setLogo(initialRestaurant.logo || '');
    }
  }, [initialRestaurant]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setErrorMessage(null);

    try {
      const uploadedUrl = await MenuService.uploadImage(file, 'logos');
      setLogo(uploadedUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload logo image');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await AuthService.updateRestaurantProfile(restaurant.id, {
        name: name.trim(),
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        phone: phone.trim(),
        address: address.trim(),
        opening_hours: openingHours.trim(),
        description: description.trim(),
        logo: logo.trim(),
      });

      setRestaurant(updated);
      setSuccessMessage('Restaurant profile & business hours updated successfully.');
      if (onUpdate) onUpdate(updated);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update restaurant profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card id="profile" className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Restaurant Identity & Operational Settings</CardTitle>
              <CardDescription>
                Manage your dining establishment branding, opening hours, and contact information
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Plan:</span>
            <Badge status={restaurant?.subscription_status || 'trialing'} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-red-800 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Logo Upload Section */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {logo ? (
                <img src={logo} alt="Restaurant Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-7 h-7 text-zinc-400" />
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Restaurant Logo & Avatar
              </div>
              <p className="text-xs text-zinc-500">
                Displayed at the top of your digital QR menu header for dining guests.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploadingLogo}
                  className="text-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload New Logo
                </Button>
                {logo && (
                  <button
                    type="button"
                    onClick={() => setLogo('')}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Restaurant Brand / Legal Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<Store className="w-4 h-4" />}
              required
            />

            <Input
              label="Menu URL Handle / Slug *"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
              helperText={`Live URL: /${slug}`}
              required
            />
          </div>

          {/* Contact & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              placeholder="+1 (212) 555-0199"
            />

            <Input
              label="Opening & Operating Hours"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
              placeholder="Mon - Sun: 11:00 AM - 10:30 PM"
            />
          </div>

          {/* Physical Address */}
          <Input
            label="Physical Street Address & City"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
            placeholder="142 Via Della Spiga, Little Italy, NY 10013"
          />

          {/* Restaurant Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Restaurant Story & Cuisine Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Authentic rustic Italian trattoria specializing in handcrafted sourdough pizzas, fresh tagliatelle, and imported Italian wines..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Restaurant Settings</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
