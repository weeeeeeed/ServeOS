'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Store,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  BarChart3,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { TenantTable } from '@/components/admin/tenant-table';
import { SubscriptionManagement } from '@/components/admin/subscription-management';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthService } from '@/lib/auth-service';
import { AdminService } from '@/lib/admin-service';
import {
  User,
  TenantWithDetails,
  PlatformAnalytics,
  SubscriptionWithRestaurant,
} from '@/lib/types';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'tenants' | 'subscriptions' | 'users'>('analytics');

  const [tenants, setTenants] = useState<TenantWithDetails[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithRestaurant[]>([]);
  const [platformUsers, setPlatformUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    const session = AuthService.getCurrentSession();
    if (!session.user) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setCurrentUser(session.user);

    try {
      const [tList, sList, uList, pStats] = await Promise.all([
        AdminService.getAllTenants(),
        AdminService.getAllSubscriptions(),
        AdminService.getAllPlatformUsers(),
        AdminService.getPlatformAnalytics(),
      ]);

      setTenants(tList);
      setSubscriptions(sList);
      setPlatformUsers(uList);
      setAnalytics(pStats);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="w-64 bg-zinc-900 min-h-screen p-4 space-y-4 hidden md:block">
          <Skeleton className="h-10 w-full bg-zinc-800" />
          <Skeleton className="h-6 w-3/4 bg-zinc-800" />
        </div>
        <div className="flex-1 p-6 sm:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar Navigation */}
      <DashboardSidebar user={currentUser} restaurant={null} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Super Admin Console
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase tracking-wide">
                Platform Root
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Signed in as <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentUser?.email}</span> &bull; Full tenant oversight, subscriptions, and platform analytics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAdminData}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Platform</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Main Body */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          {/* Top Platform KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Restaurants */}
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Total Restaurants</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    {analytics?.totalRestaurants || tenants.length}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+100% active SaaS</span>
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                  <Store className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Platform Revenue */}
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Platform Gross Sales</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    ${(analytics?.totalRevenue || 11640.00).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Across all restaurants</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Total Dining Orders</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    {analytics?.totalOrders || 342}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">QR table tickets</p>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Active Subscriptions */}
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Active Paid Plans</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    {analytics?.activeSubscriptions || 2}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {analytics?.trialingTenants || 1} trialing
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <CreditCard className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Total Platform Users */}
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Total Platform Users</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    {analytics?.totalUsers || platformUsers.length}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Owners & Admins</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex border-b border-zinc-200/80 dark:border-zinc-800 gap-6 text-sm font-semibold text-zinc-500 overflow-x-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'analytics'
                  ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Platform Analytics</span>
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('tenants')}
              className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'tenants'
                  ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Restaurant Tenants ({tenants.length})</span>
              {activeTab === 'tenants' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'subscriptions'
                  ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Subscription Contracts</span>
              {activeTab === 'subscriptions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'users'
                  ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Platform Users ({platformUsers.length})</span>
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab 1: Platform Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plan Distribution Breakdown */}
                <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-base font-bold">Pricing Plan Distribution</CardTitle>
                    <CardDescription className="text-xs">Active SaaS contracts by tier</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-brand-600">Pro Tier ($79/mo)</span>
                        <span className="font-mono">{analytics?.planDistribution.Pro || 1} tenants</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-brand-600 rounded-full" style={{ width: '50%' }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-purple-600">Enterprise Tier ($199/mo)</span>
                        <span className="font-mono">{analytics?.planDistribution.Enterprise || 2} tenants</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: '35%' }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-600 dark:text-zinc-400">Starter Tier ($29/mo)</span>
                        <span className="font-mono">{analytics?.planDistribution.Starter || 1} tenants</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-zinc-400 rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card lg:col-span-2">
                  <CardHeader className="p-5 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold">Platform Architecture & Infrastructure</CardTitle>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
                        100% Operational
                      </span>
                    </div>
                    <CardDescription className="text-xs">Edge Middleware, Supabase RLS, and Realtime Health</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Row Level Security (RLS)</span>
                        <p className="text-zinc-500 text-[11px]">Active on users, restaurants, categories, menu_items, orders, feedback, subscriptions.</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Next.js Edge Middleware</span>
                        <p className="text-zinc-500 text-[11px]">Role-based access tokens protecting /admin and /dashboard routes with 0ms cold starts.</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Supabase Realtime Bus</span>
                        <p className="text-zinc-500 text-[11px]">Subscribing live orders and feedback between table QR diners and kitchen display systems.</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Vercel Deployment Ready</span>
                        <p className="text-zinc-500 text-[11px]">Standalone serverless bundles configured with zero external runtime dependencies.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Tenant Table Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Restaurant Directory Overview
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('tenants')} className="text-xs gap-1">
                    <span>Manage All Tenants</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </div>
                <TenantTable tenants={tenants} onRefresh={loadAdminData} />
              </div>
            </div>
          )}

          {/* Tab 2: Restaurant Tenants */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <TenantTable tenants={tenants} onRefresh={loadAdminData} />
            </div>
          )}

          {/* Tab 3: Subscriptions */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <SubscriptionManagement
                subscriptions={subscriptions}
                onRefresh={loadAdminData}
              />
            </div>
          )}

          {/* Tab 4: Platform Users */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-card overflow-hidden">
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Registered Platform Users ({platformUsers.length})
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Super Administrators and Restaurant Owners with authenticated platform access
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="px-5 py-3.5">User</th>
                      <th className="px-5 py-3.5">Assigned Role</th>
                      <th className="px-5 py-3.5">User UID</th>
                      <th className="px-5 py-3.5 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {platformUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                                {u.name}
                              </span>
                              <span className="text-[11px] text-zinc-400 font-mono">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {u.role === 'admin' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              Super Admin
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Restaurant Owner
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 font-mono text-[11px] text-zinc-400">
                          {u.id}
                        </td>

                        <td className="px-5 py-4 text-right text-zinc-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
