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
    <aside className="w-64 bg-zinc-950 text-zinc-100 flex flex-col flex-shrink-0 min-h-screen border-r border-zinc-800">
      {/* Super Admin Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">Super Admin</span>
            </div>
            <span className="text-[11px] text-zinc-400">Platform Control</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Access Level</span>
          <Badge variant="purple">Root Admin</Badge>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Tenant Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.current
                  ? 'bg-purple-950/50 text-purple-200 border border-purple-800/40 font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.current ? 'text-purple-400' : 'text-zinc-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="mt-8 p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs text-purple-200 space-y-2">
          <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Tenant RBAC</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            As Super Admin, you can inspect all restaurant tenants, monitor subscription statuses, and inspect all platform user credentials.
          </p>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-700 text-purple-200 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-zinc-200 truncate">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-zinc-400 truncate">
                {user?.email || 'admin@demo.com'}
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
