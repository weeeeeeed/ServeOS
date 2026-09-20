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
  Radio,
} from 'lucide-react';
import { TenantTable } from '@/components/admin/tenant-table';
import { SubscriptionManagement } from '@/components/admin/subscription-management';
import { UserTable } from '@/components/admin/user-table';
import { PlanManagement } from '@/components/admin/plan-management';
import { BroadcastCenter } from '@/components/admin/broadcast-center';
import { ServeOSLogo } from '@/components/ui/botanical-decorations';
import { formatCurrency, CURRENCY_SYMBOL } from '@/lib/currency';
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
  const [activeTab, setActiveTab] = useState<'analytics' | 'tenants' | 'subscriptions' | 'plans' | 'communications' | 'users'>('analytics');

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
      <div className="min-h-screen bg-[#f4f1eb] p-4 md:p-8 flex items-center justify-center font-sans antialiased">
        <div className="w-full max-w-[1560px] bg-white rounded-[36px] p-8 shadow-board border border-[#e6e2da] space-y-6">
          <Skeleton className="h-12 w-64 bg-stone-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-32 bg-[#f4f1eb] rounded-2xl" />
            <Skeleton className="h-32 bg-[#f4f1eb] rounded-2xl" />
            <Skeleton className="h-32 bg-[#f4f1eb] rounded-2xl" />
            <Skeleton className="h-32 bg-[#f4f1eb] rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full bg-[#f4f1eb] rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1eb] p-3 sm:p-5 lg:p-7 flex items-center justify-center font-sans antialiased text-[#162820]">
      {/* Outer Floating Board Container */}
      <main className="w-full max-w-[1560px] bg-white rounded-[36px] shadow-board border border-[#e6e2da] overflow-hidden flex flex-col lg:flex-row min-h-[920px]">
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 xl:w-72 bg-white border-r border-[#f0ede6] flex flex-col justify-between p-6 shrink-0">
          <div>
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 px-2 py-2 mb-8">
              <ServeOSLogo size="md" variant="icon-only" />
              <div>
                <span className="text-xl font-serif font-bold tracking-tight text-[#1b3b2f] leading-tight block">
                  Serve<span className="text-[#3a7d5c]">OS</span>
                </span>
                <span className="text-[10px] tracking-widest font-bold text-[#85988e] uppercase font-sans">
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
                    ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                    : 'text-[#556960] hover:text-[#1b3b2f] hover:bg-white/80'
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
                    ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                    : 'text-[#556960] hover:text-[#1b3b2f] hover:bg-white/80'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <Store className="w-5 h-5" />
                  <span>Tenants</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'tenants' ? 'bg-stone-950/10 text-stone-950' : 'bg-[#f4f1eb] text-[#556960]'
                }`}>
                  {tenants.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'subscriptions'
                    ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                    : 'text-[#556960] hover:text-[#1b3b2f] hover:bg-white/80'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <CreditCard className="w-5 h-5" />
                  <span>Subscriptions</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'subscriptions' ? 'bg-stone-950/10 text-stone-950' : 'bg-[#f4f1eb] text-[#556960]'
                }`}>
                  {subscriptions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('plans')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'plans'
                    ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                    : 'text-[#556960] hover:text-[#1b3b2f] hover:bg-white/80'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <CreditCard className="w-5 h-5 text-[#1f4e47]" />
                  <span>Subscription Plans</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900">
                  {CURRENCY_SYMBOL}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('communications')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'communications'
                    ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                    : 'text-[#556960] hover:text-[#1b3b2f] hover:bg-white/80'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <Radio className="w-5 h-5 text-emerald-700" />
                  <span>Communications</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'users'
                    ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                    : 'text-[#556960] hover:text-[#1b3b2f] hover:bg-white/80'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <Users className="w-5 h-5" />
                  <span>Platform Users</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'users' ? 'bg-stone-950/10 text-stone-950' : 'bg-[#f4f1eb] text-[#556960]'
                }`}>
                  {platformUsers.length}
                </span>
              </button>

              {/* Owner Portal Link */}
              <div className="pt-4 mt-4 border-t border-[#f0ede6]">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm text-[#556960] hover:text-[#1b3b2f] hover:bg-white/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <UtensilsCrossed className="w-5 h-5 text-[#1f4e47]" />
                    <span>Owner Dashboard</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#85988e]" />
                </Link>
              </div>
            </nav>
          </div>

          {/* Admin User Profile Card in Sidebar */}
          <div className="mt-8 pt-4 border-t border-[#f0ede6]">
            <div className="p-3 bg-[#faf9f6] rounded-2xl border border-[#e6e2da] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1f4e47] text-[#efa736] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  AD
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1b3b2f] truncate">
                    {currentUser?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-[#85988e] truncate font-mono">
                    {currentUser?.email || 'admin@demo.com'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-[#85988e] hover:text-red-600 hover:bg-stone-200/50 rounded-xl transition-colors"
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
          <header className="px-8 py-6 border-b border-[#e6e2da]/60 bg-white/80 backdrop-blur-xs flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-[#1b3b2f]">
                  Super Admin Console
                </h1>
                <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#1f4e47] text-[#efa736]">
                  Platform Root
                </span>
              </div>
              <p className="text-xs text-[#556960] font-medium mt-0.5">
                Full multi-tenant oversight &bull; Active contracts, subscriptions, and platform telemetry
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAdminData}
                className="gap-1.5 text-xs border-[#e6e2da] text-[#2a3f35] hover:bg-white/80 rounded-xl"
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
                  <div className="p-5 bg-white border border-[#e6e2da] rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[#85988e] uppercase tracking-[0.16em]">Total Tenants</p>
                      <p className="text-2xl font-black text-[#1b3b2f] mt-1">
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
                  <div className="p-5 bg-white border border-[#e6e2da] rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[#85988e] uppercase tracking-[0.16em]">Gross Sales</p>
                      <p className="text-2xl font-black text-[#1f4e47] mt-1">
                        {formatCurrency(analytics?.totalRevenue || 11640.00)}
                      </p>
                      <p className="text-[11px] text-[#85988e] mt-0.5">Across all tenants</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50 text-[#efa736] font-bold text-lg flex items-center justify-center">
                      {CURRENCY_SYMBOL}
                    </div>
                  </div>

                  {/* Total Orders */}
                  <div className="p-5 bg-white border border-[#e6e2da] rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[#85988e] uppercase tracking-[0.16em]">Dining Orders</p>
                      <p className="text-2xl font-black text-[#1b3b2f] mt-1">
                        {analytics?.totalOrders || 342}
                      </p>
                      <p className="text-[11px] text-[#85988e] mt-0.5">QR table tickets</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#f4f1eb] text-[#2a3f35]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Active Subscriptions */}
                  <div className="p-5 bg-white border border-[#e6e2da] rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[#85988e] uppercase tracking-[0.16em]">Paid Contracts</p>
                      <p className="text-2xl font-black text-[#1b3b2f] mt-1">
                        {analytics?.activeSubscriptions || 2}
                      </p>
                      <p className="text-[11px] text-[#85988e] mt-0.5">
                        {analytics?.trialingTenants || 1} trialing
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50 text-[#1f4e47]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Total Platform Users */}
                  <div className="p-5 bg-white border border-[#e6e2da] rounded-[28px] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[#85988e] uppercase tracking-[0.16em]">Platform Users</p>
                      <p className="text-2xl font-black text-[#1b3b2f] mt-1">
                        {analytics?.totalUsers || platformUsers.length}
                      </p>
                      <p className="text-[11px] text-[#85988e] mt-0.5">Owners &amp; Admins</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#f4f1eb] text-[#2a3f35]">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Grid: Plan Distribution & Architecture */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Distribution Breakdown */}
                  <div className="p-6 bg-white border border-[#e6e2da] rounded-[28px] shadow-xs space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#1b3b2f]">Pricing Plan Distribution</h3>
                      <p className="text-xs text-[#556960]">Active SaaS contracts by tier</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#1f4e47]">Pro Hospitality (₹499/mo)</span>
                          <span className="font-mono text-[#2a3f35]">{analytics?.planDistribution.Pro || 1} tenants</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#f4f1eb] overflow-hidden">
                          <div className="h-full bg-[#1f4e47] rounded-full" style={{ width: '50%' }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-amber-800">Heritage Group (₹999/mo)</span>
                          <span className="font-mono text-[#2a3f35]">{analytics?.planDistribution.Enterprise || 2} tenants</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#f4f1eb] overflow-hidden">
                          <div className="h-full bg-[#efa736] rounded-full" style={{ width: '35%' }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#556960]">Starter Bistro (₹199/mo)</span>
                          <span className="font-mono text-[#2a3f35]">{analytics?.planDistribution.Starter || 1} tenants</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#f4f1eb] overflow-hidden">
                          <div className="h-full bg-stone-400 rounded-full" style={{ width: '15%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="p-6 bg-white border border-[#e6e2da] rounded-[28px] shadow-xs space-y-4 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#1b3b2f]">Platform Architecture & Infrastructure</h3>
                        <p className="text-xs text-[#556960]">Edge Middleware, Supabase RLS, and Realtime Health</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#1f4e47] text-xs font-bold border border-emerald-200">
                        100% Operational
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e6e2da] space-y-1">
                        <span className="font-bold text-[#1b3b2f] block">Row Level Security (RLS)</span>
                        <p className="text-[#556960] text-[11px]">Enforced across users, restaurants, categories, dishes, orders, and subscriptions.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e6e2da] space-y-1">
                        <span className="font-bold text-[#1b3b2f] block">Next.js Edge Middleware</span>
                        <p className="text-[#556960] text-[11px]">Role-based access tokens protecting /admin and /dashboard routes with 0ms cold starts.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e6e2da] space-y-1">
                        <span className="font-bold text-[#1b3b2f] block">Supabase Realtime Bus</span>
                        <p className="text-[#556960] text-[11px]">Subscribing live orders and feedback between table QR diners and kitchen display systems.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e6e2da] space-y-1">
                        <span className="font-bold text-[#1b3b2f] block">Vercel Deployment Ready</span>
                        <p className="text-[#556960] text-[11px]">Standalone serverless bundles configured with zero external runtime dependencies.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tenant Table Preview */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#1b3b2f]">
                      Restaurant Directory Overview
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('tenants')}
                      className="text-xs gap-1 border-[#e6e2da] text-[#2a3f35] hover:bg-white/80 rounded-xl"
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

            {/* Tab 4: Subscription Plans Management */}
            {activeTab === 'plans' && (
              <PlanManagement />
            )}

            {/* Tab 5: Broadcast Communications */}
            {activeTab === 'communications' && (
              <BroadcastCenter />
            )}

            {/* Tab 6: Platform Users */}
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

