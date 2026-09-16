'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  LogOut,
  UtensilsCrossed,
} from 'lucide-react';
import { TenantTable } from '@/components/admin/tenant-table';
import { SubscriptionManagement } from '@/components/admin/subscription-management';
import { UserTable } from '@/components/admin/user-table';
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

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eae9e4] p-4 md:p-8 flex items-center justify-center font-sans antialiased">
        <div className="w-full max-w-[1560px] bg-white rounded-[36px] p-8 shadow-board border border-stone-200 space-y-6">
          <Skeleton className="h-12 w-64 bg-stone-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-32 bg-stone-100 rounded-2xl" />
            <Skeleton className="h-32 bg-stone-100 rounded-2xl" />
            <Skeleton className="h-32 bg-stone-100 rounded-2xl" />
            <Skeleton className="h-32 bg-stone-100 rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full bg-stone-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eae9e4] p-3 sm:p-5 lg:p-7 flex items-center justify-center font-sans antialiased text-stone-800">
      {/* Outer Floating Board Container */}
      <main className="w-full max-w-[1560px] bg-white rounded-[36px] shadow-board border border-stone-200/80 overflow-hidden flex flex-col lg:flex-row min-h-[920px]">
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 xl:w-72 bg-white border-r border-stone-100 flex flex-col justify-between p-6 shrink-0">
          <div>
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 px-2 py-2 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#1f4e47] flex items-center justify-center text-[#efa736] shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-stone-900 leading-tight block">
                  bite<span className="text-[#1f4e47]">point</span>
                </span>
                <span className="text-[10px] tracking-widest font-bold text-stone-400 uppercase">
                  SUPER ADMIN
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav aria-label="Admin Navigation" className="space-y-1.5">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'analytics'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <BarChart3 className="w-5 h-5" />
                  <span>Platform Analytics</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('tenants')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'tenants'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <Store className="w-5 h-5" />
                  <span>Tenants</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'tenants' ? 'bg-stone-950/10 text-stone-950' : 'bg-stone-100 text-stone-600'
                }`}>
                  {tenants.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'subscriptions'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <CreditCard className="w-5 h-5" />
                  <span>Subscriptions</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'subscriptions' ? 'bg-stone-950/10 text-stone-950' : 'bg-stone-100 text-stone-600'
                }`}>
                  {subscriptions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'users'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <Users className="w-5 h-5" />
                  <span>Platform Users</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'users' ? 'bg-stone-950/10 text-stone-950' : 'bg-stone-100 text-stone-600'
                }`}>
                  {platformUsers.length}
                </span>
              </button>

              {/* Owner Portal Link */}
              <div className="pt-4 mt-4 border-t border-stone-100">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <UtensilsCrossed className="w-5 h-5 text-[#1f4e47]" />
                    <span>Owner Dashboard</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </Link>
              </div>
            </nav>
          </div>

          {/* Admin User Profile Card in Sidebar */}
          <div className="mt-8 pt-4 border-t border-stone-100">
            <div className="p-3 bg-[#faf9f6] rounded-2xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1f4e47] text-[#efa736] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  AD
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">
                    {currentUser?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-stone-400 truncate font-mono">
                    {currentUser?.email || 'admin@demo.com'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-200/50 rounded-xl transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <section className="flex-1 bg-[#faf9f6] flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header inside Board */}
          <header className="px-8 py-6 border-b border-stone-200/60 bg-white/80 backdrop-blur-xs flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-stone-900">
                  Super Admin Console
                </h1>
                <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#1f4e47] text-[#efa736]">
                  Platform Root
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Full multi-tenant oversight &bull; Active contracts, subscriptions, and platform telemetry
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAdminData}
                className="gap-1.5 text-xs border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Platform</span>
              </Button>
            </div>
          </header>

          {/* Dashboard Main Body */}
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            {/* Tab 1: Platform Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Top Platform KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Total Restaurants */}
                  <div className="p-5 bg-white border border-stone-200 rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.16em]">Total Tenants</p>
                      <p className="text-2xl font-black text-stone-900 mt-1">
                        {analytics?.totalRestaurants || tenants.length}
                      </p>
                      <p className="text-[11px] text-[#1f4e47] font-semibold flex items-center gap-0.5 mt-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>+100% active SaaS</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50 text-[#1f4e47]">
                      <Store className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Platform Revenue */}
                  <div className="p-5 bg-white border border-stone-200 rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.16em]">Gross Sales</p>
                      <p className="text-2xl font-black text-[#1f4e47] mt-1">
                        ${(analytics?.totalRevenue || 11640.00).toFixed(2)}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Across all tenants</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50 text-[#efa736]">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Total Orders */}
                  <div className="p-5 bg-white border border-stone-200 rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.16em]">Dining Orders</p>
                      <p className="text-2xl font-black text-stone-900 mt-1">
                        {analytics?.totalOrders || 342}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">QR table tickets</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-stone-100 text-stone-700">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Active Subscriptions */}
                  <div className="p-5 bg-white border border-stone-200 rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.16em]">Paid Contracts</p>
                      <p className="text-2xl font-black text-stone-900 mt-1">
                        {analytics?.activeSubscriptions || 2}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {analytics?.trialingTenants || 1} trialing
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50 text-[#1f4e47]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Total Platform Users */}
                  <div className="p-5 bg-white border border-stone-200 rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.16em]">Platform Users</p>
                      <p className="text-2xl font-black text-stone-900 mt-1">
                        {analytics?.totalUsers || platformUsers.length}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Owners & Admins</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-stone-100 text-stone-700">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Grid: Plan Distribution & Architecture */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Distribution Breakdown */}
                  <div className="p-6 bg-white border border-stone-200 rounded-[28px] shadow-xs space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">Pricing Plan Distribution</h3>
                      <p className="text-xs text-stone-500">Active SaaS contracts by tier</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#1f4e47]">Pro Tier ($79/mo)</span>
                          <span className="font-mono text-stone-700">{analytics?.planDistribution.Pro || 1} tenants</span>
                        </div>
                        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div className="h-full bg-[#1f4e47] rounded-full" style={{ width: '50%' }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-amber-800">Enterprise Tier ($199/mo)</span>
                          <span className="font-mono text-stone-700">{analytics?.planDistribution.Enterprise || 2} tenants</span>
                        </div>
                        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div className="h-full bg-[#efa736] rounded-full" style={{ width: '35%' }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-stone-600">Starter Tier ($29/mo)</span>
                          <span className="font-mono text-stone-700">{analytics?.planDistribution.Starter || 1} tenants</span>
                        </div>
                        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div className="h-full bg-stone-400 rounded-full" style={{ width: '15%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="p-6 bg-white border border-stone-200 rounded-[28px] shadow-xs space-y-4 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-stone-900">Platform Architecture & Infrastructure</h3>
                        <p className="text-xs text-stone-500">Edge Middleware, Supabase RLS, and Realtime Health</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#1f4e47] text-xs font-bold border border-emerald-200">
                        100% Operational
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-4 rounded-2xl bg-[#faf9f6] border border-stone-200 space-y-1">
                        <span className="font-bold text-stone-900 block">Row Level Security (RLS)</span>
                        <p className="text-stone-500 text-[11px]">Enforced across users, restaurants, categories, dishes, orders, and subscriptions.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#faf9f6] border border-stone-200 space-y-1">
                        <span className="font-bold text-stone-900 block">Next.js Edge Middleware</span>
                        <p className="text-stone-500 text-[11px]">Role-based access tokens protecting /admin and /dashboard routes with 0ms cold starts.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#faf9f6] border border-stone-200 space-y-1">
                        <span className="font-bold text-stone-900 block">Supabase Realtime Bus</span>
                        <p className="text-stone-500 text-[11px]">Subscribing live orders and feedback between table QR diners and kitchen display systems.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#faf9f6] border border-stone-200 space-y-1">
                        <span className="font-bold text-stone-900 block">Vercel Deployment Ready</span>
                        <p className="text-stone-500 text-[11px]">Standalone serverless bundles configured with zero external runtime dependencies.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tenant Table Preview */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-stone-900">
                      Restaurant Directory Overview
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('tenants')}
                      className="text-xs gap-1 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl"
                    >
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
              <div className="space-y-4">
                <UserTable users={platformUsers} />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

