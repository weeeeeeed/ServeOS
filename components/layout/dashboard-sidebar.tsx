'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  QrCode,
  CreditCard,
  LogOut,
  ExternalLink,
  UtensilsCrossed,
  Sparkles,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthService } from '@/lib/auth-service';
import { User, Restaurant } from '@/lib/types';

interface DashboardSidebarProps {
  user: User | null;
  restaurant: Restaurant | null;
}

export function DashboardSidebar({ user, restaurant }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard',
    },
    {
      name: 'Restaurant Profile',
      href: '/dashboard#profile',
      icon: Store,
      current: pathname === '/dashboard#profile',
    },
    {
      name: 'QR Menu Live View',
      href: restaurant?.slug ? `/r/${restaurant.slug}` : '/r/la-piazza',
      icon: ExternalLink,
      isExternal: true,
    },
  ];

  return (
    <aside className="w-64 bg-zinc-900 text-zinc-100 flex flex-col flex-shrink-0 min-h-screen border-r border-zinc-800">
      {/* Restaurant Header */}
      <div className="p-4 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
            {restaurant?.name ? restaurant.name.charAt(0).toUpperCase() : 'R'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-sm truncate text-white">
              {restaurant?.name || 'My Restaurant'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-zinc-400 truncate">
                /{restaurant?.slug || 'slug'}
              </span>
            </div>
          </div>
        </Link>

        {/* Subscription Status Pill */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Plan Status</span>
          <Badge status={restaurant?.subscription_status || 'trialing'} />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Restaurant Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return item.isExternal ? (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800/70 hover:text-white transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                <span>{item.name}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 opacity-60 group-hover:opacity-100" />
            </a>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.current
                  ? 'bg-zinc-800 text-white font-semibold shadow-inner'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.current ? 'text-brand-400' : 'text-zinc-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Informational Next Step Card */}
        <div className="mt-8 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400 space-y-2">
          <div className="flex items-center gap-1.5 text-brand-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1: Foundation</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Multi-tenant auth and tenant profile management active. Menu and ordering features are queued for Phase 2.
          </p>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OW'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-zinc-200 truncate">
                {user?.name || 'Owner'}
              </span>
              <span className="text-[10px] text-zinc-400 truncate">
                {user?.email || 'owner@demo.com'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-zinc-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
