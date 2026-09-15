'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  UtensilsCrossed,
  Receipt,
  TableProperties,
  Wallet,
  Settings,
  MessageSquare,
  LogOut,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { BitepointOverview } from '@/components/dashboard/bitepoint-overview';
import { KitchenOrders } from '@/components/dashboard/kitchen-orders';
import { MenuManagement } from '@/components/dashboard/menu-management';
import { TableQrStudio } from '@/components/dashboard/table-qr-studio';
import { AccountingLedger } from '@/components/dashboard/accounting-ledger';
import { BitepointSettings } from '@/components/dashboard/bitepoint-settings';
import { FeedbackSection } from '@/components/dashboard/feedback-section';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthService } from '@/lib/auth-service';
import { OrderService } from '@/lib/order-service';
import { FeedbackService } from '@/lib/feedback-service';
import { User, Restaurant, OrderWithItems, FeedbackStats } from '@/lib/types';

export default function BitepointDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders' | 'tables' | 'accounting' | 'settings' | 'feedback'>('overview');
  const [loading, setLoading] = useState(true);

  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    averageRating: 5.0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const loadDashboard = async () => {
    const session = AuthService.getCurrentSession();
    if (!session.user) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    if (session.user.role === 'admin') {
      router.push('/admin');
      return;
    }

    setUser(session.user);
    setRestaurant(session.restaurant);

    if (session.restaurant?.id) {
      const [oList, fStats] = await Promise.all([
        OrderService.getRestaurantOrders(session.restaurant.id),
        FeedbackService.getFeedbackStats(session.restaurant.id),
      ]);
      setOrders(oList);
      setFeedbackStats(fStats);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  if (loading || !restaurant || !user) {
    return (
      <div className="min-h-screen bg-[#eae9e4] p-4 md:p-8 flex items-center justify-center">
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

  const activeOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;

  return (
    <div className="min-h-screen bg-[#eae9e4] p-3 sm:p-5 lg:p-7 flex items-center justify-center font-sans antialiased text-stone-800">
      {/* Outer Rounded Board Container (Exact Stitch Screen Spec) */}
      <main className="w-full max-w-[1560px] bg-white rounded-[36px] shadow-board border border-stone-200/80 overflow-hidden flex flex-col lg:flex-row min-h-[920px]">
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 xl:w-72 bg-white border-r border-stone-100 flex flex-col justify-between p-6 shrink-0">
          <div>
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 px-2 py-2 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#1f4e47] flex items-center justify-center text-white shadow-sm">
                <UtensilsCrossed className="w-5 h-5 text-[#efa736]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-stone-900 leading-tight block">
                  bite<span className="text-[#1f4e47]">point</span>
                </span>
                <span className="text-[10px] tracking-widest font-bold text-stone-400 uppercase">
                  MANAGEMENT
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav aria-label="Main Navigation" className="space-y-1.5">
              {/* Dashboard */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'overview'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <LayoutGrid className="w-5 h-5" />
                <span>Dashboard</span>
              </button>

              {/* Menu */}
              <button
                onClick={() => setActiveTab('menu')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'menu'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span>Menu</span>
              </button>

              {/* Orders */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'orders'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3.5">
                  <Receipt className="w-5 h-5" />
                  <span>Orders</span>
                </div>
                {activeOrdersCount > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'orders' ? 'bg-stone-950 text-white' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {activeOrdersCount}
                  </span>
                )}
              </button>

              {/* Table & QR Studio */}
              <button
                onClick={() => setActiveTab('tables')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'tables'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <TableProperties className="w-5 h-5" />
                <span>Tables &amp; QR</span>
              </button>

              {/* Accounting */}
              <button
                onClick={() => setActiveTab('accounting')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'accounting'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <Wallet className="w-5 h-5" />
                <span>Accounting</span>
              </button>

              {/* Reviews */}
              <button
                onClick={() => setActiveTab('feedback')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'feedback'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Reviews</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150 text-left ${
                  activeTab === 'settings'
                    ? 'bg-[#efa736] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                type="button"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* User Profile Card in Sidebar */}
          <div className="pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-stone-100/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#1f4e47]/15 text-[#1f4e47] font-black flex items-center justify-center text-xs tracking-wider border border-white shrink-0">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'GS'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">
                    {user.name || 'Gladina S.'}
                  </p>
                  <p className="text-[11px] font-medium text-stone-400 capitalize truncate">
                    {user.role === 'owner' ? 'Restaurant Owner' : 'Head Cashier'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Log Out"
                className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-200/50 transition shrink-0"
                type="button"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 lg:p-8 xl:p-9 bg-[#faf9f6]">
          {activeTab === 'overview' && (
            <BitepointOverview
              restaurant={restaurant}
              orders={orders}
              onSelectTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManagement restaurantId={restaurant.id} />
          )}

          {activeTab === 'orders' && (
            <KitchenOrders
              restaurantId={restaurant.id}
              onStatsChange={async () => {
                const refreshed = await OrderService.getRestaurantOrders(restaurant.id);
                setOrders(refreshed);
              }}
            />
          )}

          {activeTab === 'tables' && (
            <TableQrStudio restaurant={restaurant} />
          )}

          {activeTab === 'accounting' && (
            <AccountingLedger restaurant={restaurant} orders={orders} />
          )}

          {activeTab === 'feedback' && (
            <FeedbackSection restaurantId={restaurant.id} />
          )}

          {activeTab === 'settings' && (
            <BitepointSettings
              restaurant={restaurant}
              onUpdateRestaurant={(updated) => setRestaurant(updated)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
