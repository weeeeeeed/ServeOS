'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Building2,
  Users,
  Database,
  BarChart3,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AuthService } from '@/lib/auth-service';
import { User } from '@/lib/types';

interface AdminSidebarProps {
  user: User | null;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    {
      name: 'Tenant Overview',
      href: '/admin',
      icon: Building2,
      current: pathname === '/admin',
    },
    {
      name: 'Platform Users',
      href: '/admin#users',
      icon: Users,
      current: false,
    },
    {
      name: 'Subscription Matrix',
      href: '/admin#subscriptions',
      icon: BarChart3,
      current: false,
    },
  ];

  return (
    <aside className="w-64 bg-white text-stone-800 flex flex-col flex-shrink-0 min-h-screen border-r border-stone-200/80">
      {/* Super Admin Header */}
      <div className="p-5 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center shadow-xs shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-black text-base tracking-tight text-stone-900 leading-tight">
              bite<span className="text-[#1f4e47]">point</span>
            </span>
            <span className="text-[10px] tracking-widest font-bold text-stone-400 uppercase">SUPER ADMIN</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-medium">Platform Access</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#1f4e47] border border-emerald-200 uppercase tracking-wider">
            Root Admin
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">
          Management Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                item.current
                  ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="mt-8 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-[#1f4e47] space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#efa736]" />
            <span>Multi-Tenant RBAC</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Full root authority to monitor tenant subscriptions, inspect active restaurant menus, and manage platform roles.
          </p>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-stone-100 bg-[#faf9f6]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1f4e47] text-[#efa736] flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-stone-900 truncate">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-stone-400 font-mono truncate">
                {user?.email || 'admin@demo.com'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-stone-400 hover:text-red-600 transition-colors p-1.5 rounded-xl hover:bg-stone-100"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
