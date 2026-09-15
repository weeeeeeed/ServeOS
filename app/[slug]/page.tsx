'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  QrCode,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Utensils,
  Search,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { AuthService } from '@/lib/auth-service';
import { MenuService } from '@/lib/menu-service';
import { Restaurant, Category, MenuItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerRestaurantPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      AuthService.getRestaurantBySlug(slug).then(async (res) => {
        setRestaurant(res);
        if (res?.id) {
          const [cats, items] = await Promise.all([
            MenuService.getCategories(res.id),
            MenuService.getMenuItems(res.id),
          ]);
          setCategories(cats);
          setMenuItems(items);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <Skeleton className="h-20 w-20 rounded-2xl mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Restaurant Not Found</h1>
          <p className="text-xs text-zinc-500">
            No active restaurant is registered at the URL handle <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">/{slug}</code>.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="primary" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to RestoQR Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategoryId === 'all' || item.category_id === selectedCategoryId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Customer Mode Floating Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold tracking-tight">RestoQR Menu</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3" />
              <span>Customer Mode (No Login)</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {/* Restaurant Header Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-card text-center relative overflow-hidden">
          {/* Backdrop glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white flex items-center justify-center text-3xl font-bold shadow-elevated border-2 border-white dark:border-zinc-800 overflow-hidden">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{restaurant.name.charAt(0)}</span>
            )}
          </div>

          {/* Restaurant Title & Description */}
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {restaurant.name}
          </h1>

          {restaurant.description && (
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              {restaurant.description}
            </p>
          )}

          {/* Meta Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            {restaurant.opening_hours && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {restaurant.opening_hours}
                </span>
              </div>
            )}
            {restaurant.address && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span>{restaurant.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Navigation & Search */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-card space-y-3 sticky top-14 z-20">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategoryId === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              All Items ({menuItems.length})
            </button>

            {categories.map((cat) => {
              const count = menuItems.filter((i) => i.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategoryId === cat.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Feed */}
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-card space-y-3">
            <Utensils className="w-8 h-8 text-zinc-400 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No Dishes Found
            </h3>
            <p className="text-xs text-zinc-500">
              No menu items match your search or selected category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const categoryName = categoryMap.get(item.category_id) || 'Dish';
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden shadow-card flex flex-col justify-between transition-all ${
                    item.available
                      ? 'border-zinc-200/80 dark:border-zinc-800'
                      : 'border-zinc-200/60 dark:border-zinc-800/60 opacity-60'
                  }`}
                >
                  <div>
                    {/* Image */}
                    <div className="relative h-44 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-full h-full object-cover ${
                            !item.available ? 'grayscale' : ''
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Utensils className="w-8 h-8" />
                        </div>
                      )}

                      {/* Price Pill */}
                      <div className="absolute bottom-2.5 right-2.5 bg-zinc-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md">
                        ${Number(item.price).toFixed(2)}
                      </div>

                      {/* Category */}
                      <div className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded-md text-[11px] font-semibold shadow-sm">
                        {categoryName}
                      </div>

                      {/* Sold out tag */}
                      {!item.available && (
                        <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          Sold Out
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-1.5">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-zinc-800">
        Powered by RestoQR Platform &bull; Multi-Tenant Restaurant QR Menu
      </footer>
    </div>
  );
}
